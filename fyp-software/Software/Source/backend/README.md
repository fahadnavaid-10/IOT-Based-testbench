# IoT Testbed Backend (Flask)

Backend API for the Remote IoT Testbed Platform. Matches the requirements doc and works with the React frontend.

## Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env if needed (optional for local dev)
```

## Run

```bash
# From backend/
python run.py
```

Server runs at **http://localhost:5000**. For WebSocket support (real-time deployment progress), eventlet is used.

## API Base URL

Use `http://localhost:5000/api` in your React app (e.g. in a `.env` file: `VITE_API_URL=http://localhost:5000/api`).

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | | |
| POST | `/api/login` | Login (email, password) → token + user |
| POST | `/api/register` | Register researcher (fullName, email, password, institution, researchPurpose) |
| POST | `/api/logout` | Logout (requires JWT) |
| GET | `/api/me` | Current user (requires JWT) |
| **Nodes** | | |
| GET | `/api/nodes` | List all nodes |
| GET | `/api/nodes/available` | List available (idle) nodes |
| POST | `/api/nodes` | Add node (admin) |
| PUT | `/api/nodes/<node_id>` | Update node (admin) |
| DELETE | `/api/nodes/<node_id>` | Delete node (admin) |
| POST | `/api/nodes/heartbeat` | ESP32 heartbeat (nodeId, optional: batteryLevel, temperature, humidity, light) |
| **Experiments** | | |
| POST | `/api/experiments` | Create (form: name, description, startTime, endTime, firmware file, nodeIds[]) |
| GET | `/api/experiments` | List (researcher: own, admin: all) |
| GET | `/api/experiments/<id>` | Get one |
| DELETE | `/api/experiments/<id>` | Delete |
| **Deploy** | | |
| POST | `/api/deploy/<experiment_id>` | Start OTA deployment |
| GET | `/api/deploy/status/<experiment_id>` | Deployment status + per-node progress |
| **Sensor data** | | |
| POST | `/api/sensor-data` | Ingest from node (nodeId, temperature, humidity, light) |
| GET | `/api/sensor-data/<node_id>?from=...&to=...&limit=100` | Get readings |
| **Admin** | | |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/approve-user/<id>` | Approve researcher |
| GET | `/api/admin/stats` | Dashboard stats |
| **Health** | | |
| GET | `/api/health` | Health check |

## Auth

- Login returns `{ token, refreshToken, user }`. Frontend should store `token` and send it as:
  - Header: `Authorization: Bearer <token>`
- Researchers must be approved by an admin before they can log in.

## Seed data

On first run, the app creates:
- Admin: `admin@iot.dev` / `password`
- Researcher: `researcher@iot.dev` / `password`
- 12 nodes: NODE-001 … NODE-012 (NODE-003, NODE-008 offline)

## Database

Default: SQLite (`app.db` in the backend folder). For MySQL set `DATABASE_URL` in `.env` to e.g. `mysql+pymysql://user:pass@localhost/iot_testbed`.
