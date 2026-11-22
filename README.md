# IoT-Based Remote Testbed Platform

A full-stack, distributed platform for remote IoT device management, OTA firmware deployment, real-time sensor telemetry, and experiment tracking.

---

## 🚀 Quick Start Guide (For Team Members)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.10+** (with `pip` and added to system `PATH`)
- **Node.js 18+** & `npm`
- **Git**

---

### 2. One-Click Setup & Launch (Windows)

We have included automated batch scripts to get you running in minutes:

1. **Install all dependencies:**
   Double-click `setup.bat` (or run it via terminal):
   ```cmd
   setup.bat
   ```
   *This automatically creates the Python `venv`, installs backend requirements, sets up `.env` files, and installs all frontend `npm` packages.*

2. **Run the entire system:**
   Double-click `start.bat` (or run via terminal):
   ```cmd
   start.bat
   ```
   *This starts the Flask backend at `http://localhost:5000` and the Vite/React frontend at `http://localhost:8080` (or `http://localhost:5173`).*

---

### 3. Manual Setup (Alternative)

#### Backend Setup
```bash
cd fyp-software/Software/Source/backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python run.py
```
Backend will be live at: `http://localhost:5000`

#### Frontend Setup
```bash
cd fyp-software/Software/Source/Frontend
npm install
npm run dev
```
Frontend will be live at: `http://localhost:8080` (or the port shown in console).

---

## 🗄️ Database & Initial Data

The project is pre-configured with a local SQLite database containing test users, active nodes, telemetry logs, and experiments:

- **Active SQLite DB File:** `fyp-software/Software/Source/backend/app.db` (tracked in Git so everyone shares the exact same database state).
- **SQLite SQL Dump:** `fyp-software/Software/Database/sqlite_dump.sql`
- **PostgreSQL / MySQL Schema & Dump:** `fyp-software/Software/Database/remote_iot_testbed.sql`

### 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@iot.dev` | `password` |
| **Researcher** | `researcher@iot.dev` | `password` |

---

## 📁 Repository Structure

```
├── setup.bat                                # 1-click dependency installer
├── start.bat                                # 1-click backend + frontend launcher
├── README.md                                # Project documentation & setup guide
├── FYP-ID08-2025-26/                        # FYP documentation & slides
│   ├── Documents/                           # Proposals, Research Paper, Final Report
│   └── Presentations/                       # Presentation slide decks
└── fyp-software/
    ├── start_project.bat                    # Software launcher
    └── Software/
        ├── Database/                        # Database SQL dumps
        │   ├── remote_iot_testbed.sql       # Postgres database dump
        │   └── sqlite_dump.sql              # SQLite text dump
        ├── Executable/                      # Standalone backend + frontend dist
        ├── Tools/                           # Tools reference
        └── Source/
            ├── backend/                     # Flask REST API + WebSockets
            │   ├── app.db                   # Active SQLite database
            │   ├── app/                     # Flask application package
            │   ├── migrations/              # Alembic database migrations
            │   ├── requirements.txt         # Python dependencies
            │   ├── run.py                   # Server entrypoint
            │   └── simulate_telemetry.py    # Test telemetry generator
            ├── Frontend/                    # React + Vite + Tailwind dashboard
            │   ├── package.json             # NPM dependencies
            │   └── src/                     # React source code & components
            └── ESP32/                       # ESP32 firmware source code (.ino)
```

---

## 📡 ESP32 Node Firmware & Simulation
- **Firmware Source:** `fyp-software/Software/Source/ESP32/ESP32_Testbed_Node.ino`
- **Telemetry Simulation:** If you don't have physical ESP32 nodes connected, you can simulate live heartbeats and sensor metrics using:
  ```bash
  cd fyp-software/Software/Source/backend
  venv\Scripts\python simulate_telemetry.py
  ```
