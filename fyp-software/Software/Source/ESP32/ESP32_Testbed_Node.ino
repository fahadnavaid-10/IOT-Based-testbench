/*
 * Remote IoT Testbed Platform - ESP32 Node Firmware Sample
 * 
 * Functions:
 * 1. Connects to Wi-Fi
 * 2. Reads sensors (DHT11/DHT22 temperature & humidity, Light LDR/Photoresistor)
 * 3. Sends sensor data & heartbeats to Flask backend
 * 4. Checks for OTA firmware updates from backend and applies them automatically
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <HTTPUpdate.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>

// ================= USER CONFIGURATION =================
const char* WIFI_SSID     = "FYP-testing";        // <-- Put your Wi-Fi name here
const char* WIFI_PASS     = "12345678";    // <-- Put your Wi-Fi password here

// Backend URL (Your Laptop's Mobile Hotspot IP address)
const char* SERVER_BASE   = "http://192.168.137.1:5000";

// Node Information
const char* NODE_ID       = "NODE-001";              // Default node identifier
const char* CURRENT_VER   = "1.0.0";                 // Initial firmware version

// Use hardware MAC address for identification (true = use MAC, false = use NODE_ID above)
const bool  USE_HARDWARE_MAC = true;

// Hardware Pin Definitions
#define DHTPIN            4         // DHT sensor connected to GPIO4
#define DHTTYPE           DHT11     // or DHT22
#define LDR_PIN           34        // Analog pin for Light Sensor (ADC1)

DHT dht(DHTPIN, DHTTYPE);

unsigned long lastSensorTime = 0;
const unsigned long SENSOR_INTERVAL = 10000;  // Send telemetry every 10 seconds

unsigned long lastOtaCheck = 0;
const unsigned long OTA_INTERVAL = 30000;     // Check for OTA every 30 seconds

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- Remote IoT Testbed Node Initializing ---");
  Serial.printf("Node ID: %s | Firmware Version: %s\n", NODE_ID, CURRENT_VER);

  dht.begin();

  // Connect to Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n==============================================");
  Serial.println("[OK] Connected to Wi-Fi!");
  Serial.println("ESP32 IP Address : " + WiFi.localIP().toString());
  Serial.println("ESP32 MAC Address: " + WiFi.macAddress());
  Serial.println("==============================================\n");
}

// Helper to get device ID
String getDeviceId() {
  if (USE_HARDWARE_MAC) {
    return WiFi.macAddress();
  }
  return String(NODE_ID);
}

// ================= HEARTBEAT & SENSOR TELEMETRY =================
void sendHeartbeatAndTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  int lightRaw = analogRead(LDR_PIN);
  int lightVal = map(lightRaw, 0, 4095, 0, 1000); // Normalized light value

  // Fallback simulated values if sensors are not wired to pins yet
  if (isnan(temp)) temp = 25.5 + (random(-10, 15) / 10.0);
  if (isnan(hum))  hum  = 54.0 + (random(-20, 20) / 10.0);

  WiFiClient client;
  HTTPClient http;

  String url = String(SERVER_BASE) + "/api/sensor-data";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON Payload
  StaticJsonDocument<256> doc;
  doc["nodeId"]      = getDeviceId();
  doc["temperature"] = temp;
  doc["humidity"]    = hum;
  doc["light"]       = lightVal;
  doc["battery"]     = 95;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode > 0) {
    Serial.printf("[Sensor Data] Sent -> Device: %s | Temp: %.1f°C | Hum: %.1f%% | Light: %d (HTTP %d)\n", 
                  getDeviceId().c_str(), temp, hum, lightVal, httpCode);
  } else {
    Serial.printf("[Sensor Data] Error connecting to server: %s\n", http.errorToString(httpCode).c_str());
  }
  http.end();
}

// ================= OTA UPDATE CHECK =================
void checkAndApplyOTA() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClient client;
  HTTPClient http;

  String checkUrl = String(SERVER_BASE) + "/api/check-update?version=" + String(CURRENT_VER);
  http.begin(client, checkUrl);

  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    StaticJsonDocument<512> doc;
    DeserializationError err = deserializeJson(doc, payload);

    if (!err && doc["update"] == true) {
      String newVersion = doc["version"];
      String downloadUrl = doc["url"];

      Serial.printf("[OTA] New firmware version (%s) detected! URL: %s\n", newVersion.c_str(), downloadUrl.c_str());
      Serial.println("[OTA] Starting firmware flashing Over-The-Air...");

      // Perform OTA Update
      t_httpUpdate_return ret = httpUpdate.update(client, downloadUrl);

      switch (ret) {
        case HTTP_UPDATE_FAILED:
          Serial.printf("[OTA] Update failed! Error (%d): %s\n", httpUpdate.getLastError(), httpUpdate.getLastErrorString().c_str());
          break;
        case HTTP_UPDATE_NO_UPDATES:
          Serial.println("[OTA] No updates available.");
          break;
        case HTTP_UPDATE_OK:
          Serial.println("[OTA] Update successful! Rebooting node...");
          // ESP32 restarts automatically on success
          break;
      }
    }
  }
  http.end();
}

// ================= MAIN LOOP =================
void loop() {
  unsigned long now = millis();

  // Send sensor telemetry periodically
  if (now - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = now;
    sendHeartbeatAndTelemetry();
  }

  // Check for OTA update during active experiment window
  if (now - lastOtaCheck >= OTA_INTERVAL) {
    lastOtaCheck = now;
    checkAndApplyOTA();
  }

  delay(10);
}
