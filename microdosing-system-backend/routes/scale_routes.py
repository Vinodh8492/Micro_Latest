import time
from flask import Blueprint, jsonify, request, Response, stream_with_context
from models.scale_data import ScaleData
from extensions import db
from utils.scale_connection import read_scale_data
import time
import random

scale_bp = Blueprint("scale", __name__)


streaming_active = True  # Global variable at top of file


@scale_bp.route("/live-weight", methods=["GET"])
def live_scale_weight():
    def generate():
        # Yield immediately small dummy message
        yield f"data: Connecting to scale...\n\n"

        # Random delay before first real reading
        initial_delay = random.uniform(1, 3)
        time.sleep(initial_delay)

        while True:
            try:
                data = read_scale_data()
                if "error" not in data:
                    raw_weight = data["weight"]
                    real_weight_kg = (raw_weight * 100) / 1000
                    yield f"data: {real_weight_kg:.3f} kg\n\n"
                else:
                    yield f"data: Error - {data['error']}\n\n"

                time.sleep(1)
            except GeneratorExit:
                # Client disconnected cleanly (no crash)
                print("Client disconnected cleanly")
                break
            except Exception as e:
                # Handle unexpected errors inside generator
                print(f"Unexpected error inside generate: {e}")
                yield f"data: Error - Internal Server Error\n\n"
                time.sleep(1)

    return Response(stream_with_context(generate()), mimetype="text/event-stream")


@scale_bp.route("/read-weight", methods=["GET"])
def read_scale_weight():
    data = read_scale_data()
    if "error" not in data:
        raw_weight = data["weight"]

        # Adjust the scaling factor properly here:
        real_weight_kg = (raw_weight * 100) / 1000

        return (
            jsonify(
                {
                    "success": True,
                    "data": {
                        "timestamp": data["timestamp"],
                        "weight_raw": raw_weight,
                        "weight_kg": real_weight_kg,
                        "error_code": data["error_code"],
                        "error_message": data["error_message"],
                    },
                }
            ),
            200,
        )
    else:
        return jsonify({"success": False, "message": data["error"]}), 500


@scale_bp.route("/stop-live-weight", methods=["POST"])
def stop_live_scale_weight():
    """
    Stop the live weight streaming.
    """
    global streaming_active
    streaming_active = False
    return jsonify({"success": True, "message": "Live weight streaming stopped"}), 200


@scale_bp.route("/save-weight", methods=["POST"])
def save_scale_weight():
    """
    Save a specific reading manually into database.
    """
    data = request.get_json()

    weight = data.get("weight")
    error_code = data.get("error_code")
    error_message = data.get("error_message", "")

    if weight is None or error_code is None:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    new_record = ScaleData(
        weight=weight, error_code=error_code, error_message=error_message
    )
    db.session.add(new_record)
    db.session.commit()

    return jsonify({"success": True, "message": "Weight saved successfully"}), 201


@scale_bp.route("/weights", methods=["GET"])
def get_saved_weights():
    """
    Get paginated saved weight readings from the database.
    Query params:
      - page (default 1)
      - per_page (default 20)
    """
    try:
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=20, type=int)

        pagination = (
            db.session.query(ScaleData)
            .order_by(ScaleData.timestamp.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        result = []
        for record in pagination.items:
            result.append(
                {
                    "id": record.id,
                    "timestamp": record.timestamp.isoformat(),
                    "weight": record.weight,
                    "error_code": record.error_code,
                    "error_message": record.error_message,
                }
            )

        return (
            jsonify(
                {
                    "success": True,
                    "page": page,
                    "per_page": per_page,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "weights": result,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Error fetching paginated weights: {e}")
        return (
            jsonify({"success": False, "message": "Failed to fetch weight records"}),
            500,
        )
