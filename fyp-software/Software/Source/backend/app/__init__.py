"""Flask application factory."""
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_migrate import Migrate

from config import Config

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="http://localhost:8080", async_mode="eventlet")


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ===== CORS setup for local development =====
    CORS(app, origins="http://localhost:8080", supports_credentials=True)

    # ===== Initialize extensions =====
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)

    with app.app_context():
        # Import models to register them with SQLAlchemy
        from app.models import (
            user,
            node,
            experiment,
            sensor_data,
            deployment,
            system_log,
        )

        # Import firmware model for OTA updates
        try:
            from app.models import firmware  # noqa: F401
        except ImportError:
            pass

        db.create_all()

        # Seed initial data if necessary
        from app.models.seed import seed_if_empty
        seed_if_empty()

    # ===== Blueprints =====
    from app.routes.auth import auth_bp
    from app.routes.nodes import nodes_bp
    from app.routes.experiments import experiments_bp
    from app.routes.deploy import deploy_bp
    from app.routes.sensor_data import sensor_data_bp
    from app.routes.admin import admin_bp

    # OTA ROUTES (NEW)
    from app.routes.ota import ota_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(nodes_bp, url_prefix="/api/nodes")
    app.register_blueprint(experiments_bp, url_prefix="/api/experiments")
    app.register_blueprint(deploy_bp, url_prefix="/api/deploy")
    app.register_blueprint(sensor_data_bp, url_prefix="/api/sensor-data")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Register OTA routes
    app.register_blueprint(ota_bp, url_prefix="/api")

    # ====================

    # Health check route
    @app.route("/api/health")
    def health():
        return {"status": "ok", "database": "connected"}

    # SocketIO event for real-time deploy updates
    @socketio.on("join_deploy")
    def on_join_deploy(data):
        """Frontend sends { experimentId: number } to get real-time deploy progress."""
        room = f"deploy_{data.get('experimentId')}"
        from flask_socketio import join_room
        join_room(room)

    return app