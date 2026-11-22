import os
import uuid
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, send_from_directory

from app import db
from app.models.firmware import Firmware
from app.models.experiment import Experiment

ota_bp = Blueprint("ota", __name__)

BASE_DIR = os.getcwd()
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "firmware")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ======================================
# Upload Firmware
# ======================================
@ota_bp.route("/upload-firmware", methods=["POST"])
def upload_firmware():

    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    version = request.form.get("version")

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not version:
        return jsonify({"error": "Firmware version missing"}), 400

    if not file.filename.endswith(".bin"):
        return jsonify({"error": "Firmware must be .bin"}), 400

    # prevent duplicate version
    existing = Firmware.query.filter_by(version=version).first()

    if existing:
        return jsonify({
            "error": f"Firmware version {version} already exists"
        }), 400

    filename = uuid.uuid4().hex + ".bin"

    filepath = os.path.join(UPLOAD_FOLDER, filename)

    file.save(filepath)

    new_fw = Firmware(
        version=version,
        filename=filename
    )

    db.session.add(new_fw)
    db.session.commit()

    return jsonify({
        "message": "Firmware uploaded successfully",
        "version": version,
        "filename": filename
    })


# ======================================
# Check OTA Update
# ======================================
@ota_bp.route("/check-update")
def check_update():

    current_version = request.args.get("version")

    if not current_version:
        return jsonify({"error": "Version parameter missing"}), 400

    # ⭐ UTC time (important for scheduler)
    now = datetime.now(timezone.utc)

    # ⭐ find ACTIVE experiment
    active_exp = Experiment.query.filter(
        Experiment.start_time <= now,
        Experiment.end_time >= now
    ).first()

    # no active experiment → no update
    if not active_exp:
        return jsonify({
            "update": False
        })

    # latest firmware
    latest = Firmware.query.order_by(
    Firmware.id.desc()
).first()

    if not latest:
        return jsonify({
            "update": False
        })

    # ⭐ prevent OTA loop
    if latest.version == current_version:

        return jsonify({
            "update": False
        })

    # ⭐ send firmware only during active experiment
    return jsonify({
        "update": True,
        "version": latest.version,
        "url": request.host_url + "api/firmware/" + latest.filename
    })


# ======================================
# Download Firmware
# ======================================
@ota_bp.route("/firmware/<filename>")
def download_firmware(filename):

    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):

        return jsonify({
            "error": "Firmware file not found"
        }), 404

    return send_from_directory(
        UPLOAD_FOLDER,
        filename,
        as_attachment=True
    )