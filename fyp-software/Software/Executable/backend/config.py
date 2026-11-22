"""Application configuration."""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads" / "firmware"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Max firmware size (e.g. 4MB)
MAX_FIRMWARE_SIZE = int(os.getenv("MAX_FIRMWARE_SIZE", 4 * 1024 * 1024))


class Config:
    """Base config."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400))  # 24 hours

    # Database: PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:maryam123@localhost:5432/iot_testbed"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS: allow React frontend
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

    UPLOAD_FOLDER = str(UPLOAD_FOLDER)
    MAX_CONTENT_LENGTH = MAX_FIRMWARE_SIZE

    # Node heartbeat: mark offline after 2 minutes
    HEARTBEAT_TIMEOUT_SECONDS = int(os.getenv("HEARTBEAT_TIMEOUT_SECONDS", 120))
