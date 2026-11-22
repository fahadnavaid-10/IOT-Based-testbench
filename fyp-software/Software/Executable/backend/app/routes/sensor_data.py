"""Sensor data: POST from nodes, GET for frontend with filters."""
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app import db
from app.models.sensor_data import SensorData
from app.models.user import User
from app.models.node import Node

sensor_data_bp = Blueprint("sensor_data", __name__)


def _current_user():
    return User.query.get(int(get_jwt_identity()))


def _is_admin():
    return get_jwt().get("role") == "admin"


@sensor_data_bp.route("", methods=["POST"])
def post_sensor_data():
    """POST /sensor-data - receive data from ESP32 (node_id, temperature, humidity, light)."""
    data = request.get_json() or {}
    node_id = (data.get("nodeId") or data.get("node_id") or "").strip()
    if not node_id:
        return jsonify({"error": "nodeId required"}), 400

    # Optionally validate node exists
    node = Node.query.filter_by(mac_address=node_id).first()

    if not node:
        return jsonify({"error": "Node not found"}), 400

    row = SensorData(
        node_id=node.node_id,
        temperature=data.get("temperature"),
        humidity=data.get("humidity"),
        light=data.get("light"),
        battery=data.get("battery")
)
    db.session.add(row)

    # Update node's latest readings for dashboard
    node = Node.query.filter_by(mac_address=node_id).first()
    if node:
        node.temperature = data.get("temperature")
        node.humidity = data.get("humidity")
        node.light = data.get("light")
        node.battery_level = data.get("battery")
        node.last_active = datetime.utcnow()

    db.session.commit()
    return jsonify({"status": "ok", "id": row.id}), 201


@sensor_data_bp.route("/<node_id>", methods=["GET"])
@jwt_required()
def get_sensor_data(node_id):
    """GET /sensor-data/{node_id}?from=...&to=... - get sensor data for a node, optional date range."""
    user = _current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    from_ = request.args.get("from")
    to_ = request.args.get("to")
    limit = min(int(request.args.get("limit", 100)), 500)

    node = Node.query.filter_by(node_id=node_id).first()

    if not node:
        return jsonify([])

    q = SensorData.query.filter_by(
        node_id=node.node_id
).order_by(
    SensorData.timestamp.desc()
).limit(limit)

    if from_:
        try:
            from_dt = datetime.fromisoformat(from_.replace("Z", "+00:00"))
            q = q.filter(SensorData.timestamp >= from_dt)
        except Exception:
            pass
    if to_:
        try:
            to_dt = datetime.fromisoformat(to_.replace("Z", "+00:00"))
            q = q.filter(SensorData.timestamp <= to_dt)
        except Exception:
            pass

    rows = q.all()
    out = [
        {
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "light": r.light,
        }
        for r in reversed(rows)
    ]
    return jsonify(out)
