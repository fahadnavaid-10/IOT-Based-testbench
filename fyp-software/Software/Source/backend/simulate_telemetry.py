"""
IoT Testbed - Node Telemetry Simulator
Simulates live sensor data (Temperature, Humidity, Light) from ESP32 nodes to the Flask API.
Uses Python standard library (no extra pip installs needed).
"""
import time
import random
import json
import urllib.request
import urllib.error

API_URL = "http://localhost:5000/api/sensor-data"
NODES = ["NODE-001", "NODE-002", "NODE-004", "NODE-005"]

def main():
    print("==================================================")
    print(" Starting IoT Node Telemetry Simulator")
    print(f" Target API: {API_URL}")
    print(f" Nodes: {', '.join(NODES)}")
    print(" Press Ctrl+C to stop")
    print("==================================================")

    base_values = {
        "NODE-001": {"temp": 24.0, "hum": 48.0, "light": 620},
        "NODE-002": {"temp": 26.5, "hum": 55.0, "light": 480},
        "NODE-004": {"temp": 22.0, "hum": 60.0, "light": 310},
        "NODE-005": {"temp": 28.0, "hum": 42.0, "light": 750},
    }

    try:
        while True:
            for node_id in NODES:
                bv = base_values[node_id]
                temp = round(bv["temp"] + random.uniform(-1.2, 1.5), 1)
                hum = round(bv["hum"] + random.uniform(-2.5, 2.5), 1)
                light = int(bv["light"] + random.uniform(-40, 50))
                battery = random.randint(85, 98)

                payload = {
                    "nodeId": node_id,
                    "temperature": temp,
                    "humidity": hum,
                    "light": light,
                    "battery": battery
                }

                try:
                    data = json.dumps(payload).encode("utf-8")
                    req = urllib.request.Request(
                        API_URL,
                        data=data,
                        headers={"Content-Type": "application/json"},
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=3) as resp:
                        code = resp.getcode()
                        print(f"[{node_id}] Sent: {temp}C, {hum}% hum, {light} lx -> [OK {code}]")
                except urllib.error.HTTPError as e:
                    print(f"[{node_id}] Server HTTP {e.code}: {e.read().decode()[:100]}")
                except Exception as e:
                    print(f"[{node_id}] Connection error: {e}")

            time.sleep(5)  # Send next batch every 5 seconds

    except KeyboardInterrupt:
        print("\nSimulator stopped.")

if __name__ == "__main__":
    main()
