

from app import db


class SensorData(db.Model):

    __tablename__ = "sensor_data"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    node_id = db.Column(db.String(32), nullable=False, index=True)

    temperature = db.Column(db.Float, nullable=True)

    humidity = db.Column(db.Float, nullable=True)

    light = db.Column(db.Float, nullable=True)

    # ✅ ADD THIS
    battery = db.Column(db.Integer, nullable=True)

    timestamp = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
        index=True
    )

    __table_args__ = (
        db.Index(
            "ix_sensor_data_node_timestamp",
            "node_id",
            "timestamp"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "nodeId": self.node_id,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "light": self.light,
            "battery": self.battery,   
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }