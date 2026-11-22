"""Authentication: login, register, logout."""
import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, create_refresh_token

from app import db
from app.models.user import User
from app.models.system_log import SystemLog

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        db.session.add(SystemLog(user_id=None, action="login_failed", details="Missing email or password"))
        db.session.commit()
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8")):
        db.session.add(SystemLog(user_id=None, action="login_failed", details=f"Invalid credentials: {email}"))
        db.session.commit()
        return jsonify({"error": "Invalid email or password"}), 401

    if user.role == "researcher" and not user.approved:
        return jsonify({"error": "Account pending approval by admin"}), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "email": user.email},
    )
    refresh_token = create_refresh_token(identity=str(user.id))

    db.session.add(SystemLog(user_id=user.id, action="login", details="Success"))
    db.session.commit()

    return jsonify({
        "token": access_token,
        "refreshToken": refresh_token,
        "user": user.to_dict(),
    })


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    full_name = (data.get("fullName") or "").strip()
    institution = (data.get("institution") or "").strip()
    research_purpose = (data.get("researchPurpose") or "").strip()

    if not all([email, password, full_name]):
        return jsonify({"error": "Name, email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(
        email=email,
        password_hash=password_hash,
        full_name=full_name,
        role="researcher",
        institution=institution or None,
        research_purpose=research_purpose or None,
        approved=False,
    )
    db.session.add(user)
    db.session.add(SystemLog(user_id=user.id, action="register", details="Researcher signup, pending approval"))
    db.session.commit()

    return jsonify({
        "message": "Registration successful. Your account is pending admin approval.",
        "userId": str(user.id),
    }), 201


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    user_id = int(get_jwt_identity())
    db.session.add(SystemLog(user_id=user_id, action="logout", details=""))
    db.session.commit()
    return jsonify({"message": "Logged out"})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())
