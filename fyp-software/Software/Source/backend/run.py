"""Run the Flask app with SocketIO + Experiment Scheduler."""
import os
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler

from app import create_app, socketio, db
from app.models.experiment import Experiment

app = create_app()


# ===============================
# Experiment Scheduler
# ===============================
def experiment_scheduler():

    from app.models.node import Node
    from app.models.experiment import ExperimentNode

    with app.app_context():

        now = datetime.now(timezone.utc)

        experiments = Experiment.query.all()

        for exp in experiments:

            if not exp.start_time or not exp.end_time:
                continue

            nodes = ExperimentNode.query.filter_by(
                experiment_id=exp.id
            ).all()

            st = exp.start_time.replace(tzinfo=timezone.utc) if (exp.start_time and exp.start_time.tzinfo is None) else exp.start_time
            et = exp.end_time.replace(tzinfo=timezone.utc) if (exp.end_time and exp.end_time.tzinfo is None) else exp.end_time

            # ACTIVE WINDOW
            if st and et and st <= now <= et:

                print(f"ACTIVE: {exp.name}")

                for n in nodes:

                    node = Node.query.filter_by(
                        node_id=n.node_id
                    ).first()

                    if node:
                        node.status = "reserved"
                        node.current_experiment_id = exp.id

            # COMPLETED
            elif et and now > et:

                print(f"COMPLETED: {exp.name}")

                for n in nodes:

                    node = Node.query.filter_by(
                        node_id=n.node_id
                    ).first()

                    if node:
                        node.status = "idle"
                        node.current_experiment_id = None

            else:

                print(f"SCHEDULED: {exp.name}")

        db.session.commit()

# ===============================
# Start Scheduler
# ===============================
scheduler = BackgroundScheduler()
scheduler.add_job(func=experiment_scheduler, trigger="interval", seconds=10)
scheduler.start()


# ===============================
# Run Server
# ===============================
if __name__ == "__main__":

    port = int(os.getenv("PORT", 5000))
    use_socketio = os.getenv("USE_SOCKETIO", "1") == "1"

    if use_socketio:
        socketio.run(
            app,
            host="0.0.0.0",
            port=port,
            debug=os.getenv("FLASK_DEBUG", "1") == "1"
        )
    else:
        app.run(
            host="0.0.0.0",
            port=port,
            debug=os.getenv("FLASK_DEBUG", "1") == "1"
        )