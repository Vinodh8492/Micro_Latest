import eventlet
eventlet.monkey_patch()

from flask import Flask, send_from_directory
from config import Config
from extensions import db, ma, migrate, jwt, socketio  # import socketio
from flask_socketio import emit
from flask_cors import CORS
import threading
from helpers.scale_reader import start_scale_reader


def create_app():
    app = Flask(__name__, static_folder="dist", static_url_path="/")
    app.config.from_object(Config)

    db.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app)
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5000",
            "http://127.0.0.1:5000",
        ],
    )

    with app.app_context():
        try:
            from models.user import User
            from models.material import Material
            from models.recipe import Recipe, RecipeMaterial
            from models.production import (
                ProductionOrder,
                Batch,
                BatchMaterialDispensing,
                MaterialTransaction,
            )
            from models.weight import WeightEntry
            from models.storage import StorageBucket
            from models.scale_data import ScaleData
            from models.smtp_profiles import SMTPProfile
            from models.report_config import ReportConfig
            from models.logo import Logo  # ✅ Add Logo model

            if not app.config["FLASK_ENV"] == "production":
                db.create_all()

        except Exception as e:
            print(f"⚠️ Error initializing database models: {e}")

        try:
            from routes.user_routes import user_bp
            from routes.material_routes import material_bp
            from routes.recipe_routes import recipe_bp
            from routes.production_routes import production_bp
            from routes.weight_routes import weight_bp
            from routes.storage_routes import storage_bp
            from routes.scale_routes import scale_bp
            from routes.smtp_routes import smtp_bp
            from routes.report_routes import report_bp
            from routes.logo_routes import logo_bp  # ✅ Import the logo blueprint

            app.register_blueprint(storage_bp, url_prefix="/api")
            app.register_blueprint(user_bp, url_prefix="/api")
            app.register_blueprint(material_bp, url_prefix="/api")
            app.register_blueprint(recipe_bp, url_prefix="/api")
            app.register_blueprint(production_bp, url_prefix="/api")
            app.register_blueprint(weight_bp, url_prefix="/api")
            app.register_blueprint(scale_bp, url_prefix="/api/scale")
            app.register_blueprint(smtp_bp, url_prefix="/api")
            app.register_blueprint(report_bp, url_prefix="/api")
            app.register_blueprint(logo_bp, url_prefix="/api")  # ✅ Register logo routes under /api

        except Exception as e:
            print(f"⚠️ Error registering Blueprints: {e}")

    # ✅ Start Scale Reader after everything is ready
    try:
        # threading.Thread(target=start_scale_reader, args=(app,), daemon=True).start()
        print("✅ Started Scale Reader Background Task")
    except Exception as e:
        print(f"⚠️ Error starting Scale Reader: {e}")

    # Serve React/Vite static build
    @app.route("/")
    def serve():
        return send_from_directory(app.static_folder, "index.html")

    @socketio.on("connect")
    def handle_connect():
        print("Client connected")
        emit("response", {"message": "Connected to server"})

    @socketio.on("disconnect")
    def handle_disconnect():
        print("Client disconnected")

    return app


# Gunicorn expects `app` variable
app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="127.0.0.1", port=5000, debug=True, use_reloader=False)
