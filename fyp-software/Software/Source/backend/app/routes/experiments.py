"""Experiment CRUD: create, list, get, delete."""
from datetime import datetime, timezone
import os
import uuid

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app import db
from app.models.user import User
from app.models.experiment import Experiment, ExperimentNode
from app.models.node import Node
from app.models.system_log import SystemLog
from app.models.firmware import Firmware
from config import Config

experiments_bp = Blueprint("experiments", __name__)


def _current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)


def _is_admin():
    return get_jwt().get("role") == "admin"


# ========================================
# CREATE EXPERIMENT
# ========================================
@experiments_bp.route("", methods=["POST"])
@jwt_required()
def create_experiment():

    try:

        user = _current_user()

        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.form.to_dict() if request.form else request.get_json(silent=True) or {}

        name = (data.get("name") or "").strip()
        description = (data.get("description") or "").strip()

        start_time = data.get("startTime") or data.get("start_time")
        end_time = data.get("endTime") or data.get("end_time")

        node_ids = request.form.getlist("nodeIds") or data.get("nodeIds") or []

        if not name:
            return jsonify({"error": "Experiment name required"}), 400

        start_dt = None
        end_dt = None

        if start_time:
            clean_start = start_time.replace("Z", "+00:00")
            start_dt = datetime.fromisoformat(clean_start)
            if start_dt.tzinfo is not None:
                start_dt = start_dt.astimezone(timezone.utc).replace(tzinfo=None)

        if end_time:
            clean_end = end_time.replace("Z", "+00:00")
            end_dt = datetime.fromisoformat(clean_end)
            if end_dt.tzinfo is not None:
                end_dt = end_dt.astimezone(timezone.utc).replace(tzinfo=None)

        firmware_path = None
        firmware_original_name = None

        if "firmware" in request.files:

            f = request.files["firmware"]

            if f.filename.lower().endswith(".bin"):

                ext = ".bin"

                filename = f"{uuid.uuid4().hex}{ext}"

                firmware_path = os.path.join(Config.UPLOAD_FOLDER, filename)

                f.save(firmware_path)

                firmware_original_name = f.filename

                version = os.path.splitext(f.filename)[0]

                fw = Firmware(
                    version=version,
                    filename=filename
                )

                db.session.add(fw)

        node_ids = [str(n).strip().upper() for n in node_ids]

        if not node_ids:
            return jsonify({"error": "Select nodes"}), 400

        available_nodes = {
            n.node_id: n
            for n in Node.query.filter(Node.status == "idle").all()
        }

        for nid in node_ids:

            if nid not in available_nodes:
                return jsonify({"error": f"Node {nid} not idle"}), 400

        exp = Experiment(
            name=name,
            description=description or None,
            start_time=start_dt,
            end_time=end_dt,
            user_id=user.id,
            firmware_path=firmware_path,
            firmware_original_name=firmware_original_name,
        )

        db.session.add(exp)
        db.session.flush()

        for nid in node_ids:

            db.session.add(
                ExperimentNode(
                    experiment_id=exp.id,
                    node_id=nid
                )
            )

            node = Node.query.filter_by(node_id=nid).first()

            if node:
                node.status = "reserved"

        db.session.add(SystemLog(
            user_id=user.id,
            action="experiment_created",
            details=exp.name
        ))

        db.session.commit()

        return jsonify(exp.to_dict()), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()

        return jsonify({
            "error": f"Experiment creation failed: {str(e)}",
            "details": str(e)
        }), 500


# ========================================
# LIST EXPERIMENTS
# ========================================
@experiments_bp.route("", methods=["GET"])
@jwt_required()
def list_experiments():

    user = _current_user()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if _is_admin():

        experiments = Experiment.query.order_by(
            Experiment.created_at.desc()
        ).all()

    else:

        experiments = Experiment.query.filter_by(
            user_id=user.id
        ).order_by(
            Experiment.created_at.desc()
        ).all()

    # ⭐ STATUS CALCULATION FIX
    now = datetime.now(timezone.utc)

    # ⭐ DEBUG
    print("\n========== EXPERIMENT DEBUG ==========")
    print("NOW UTC:", now)

    results = []

    for exp in experiments:

        status = "Scheduled"

        print("--------------------------------")
        print("Experiment:", exp.name)

        print("NOW:", now)
        print("START:", exp.start_time)
        print("END:", exp.end_time)

        print("NOW TZ:", now.tzinfo)

        if exp.start_time:
            print("START TZ:", exp.start_time.tzinfo)

        if exp.end_time:
            print("END TZ:", exp.end_time.tzinfo)

        if exp.start_time and exp.end_time:
            st = exp.start_time.replace(tzinfo=timezone.utc) if exp.start_time.tzinfo is None else exp.start_time
            et = exp.end_time.replace(tzinfo=timezone.utc) if exp.end_time.tzinfo is None else exp.end_time

            if now < st:
                status = "Scheduled"

            elif st <= now <= et:
                status = "Active"

            else:
                status = "Completed"

        data = exp.to_dict()
        data["status"] = status

        results.append(data)

    return jsonify(results)


# ========================================
# GET SINGLE EXPERIMENT
# ========================================
@experiments_bp.route("/<int:exp_id>", methods=["GET"])
@jwt_required()
def get_experiment(exp_id):

    user = _current_user()

    exp = Experiment.query.get(exp_id)

    if not exp:
        return jsonify({"error": "Experiment not found"}), 404

    if not _is_admin() and exp.user_id != user.id:
        return jsonify({"error": "Forbidden"}), 403

    now = datetime.now(timezone.utc)

    status = "Scheduled"

    if exp.start_time and exp.end_time:
        st = exp.start_time.replace(tzinfo=timezone.utc) if exp.start_time.tzinfo is None else exp.start_time
        et = exp.end_time.replace(tzinfo=timezone.utc) if exp.end_time.tzinfo is None else exp.end_time

        if now < st:
            status = "Scheduled"

        elif st <= now <= et:
            status = "Active"

        else:
            status = "Completed"

    data = exp.to_dict()
    data["status"] = status

    return jsonify(data)


# ========================================
# DELETE EXPERIMENT
# ========================================
@experiments_bp.route("/<int:exp_id>", methods=["DELETE"])
@jwt_required()
def delete_experiment(exp_id):

    user = _current_user()

    exp = Experiment.query.get(exp_id)

    if not exp:
        return jsonify({"error": "Experiment not found"}), 404

    if not _is_admin() and exp.user_id != user.id:
        return jsonify({"error": "Forbidden"}), 403

    # Release any reserved nodes back to idle
    for en in exp.experiment_nodes:
        node = Node.query.filter_by(node_id=en.node_id).first()
        if node and node.status == "reserved":
            node.status = "idle"
            node.current_experiment_id = None

    db.session.delete(exp)
    db.session.commit()

    return jsonify({"message": "Experiment deleted"})