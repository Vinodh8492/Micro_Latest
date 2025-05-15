# routes/weight_routes.py

from flask import Blueprint, request, jsonify
from extensions import db
from models.weight import WeightEntry, WeightEntrySchema

weight_bp = Blueprint("weight", __name__)

weight_schema = WeightEntrySchema()
weights_schema = WeightEntrySchema(many=True)

# POST: Create a new weight entry
@weight_bp.route("/weights", methods=["POST"])
def create_weight_entry():
    data = request.json

    try:
        new_entry = WeightEntry(
            current_weight=data["current_weight"],
            tare_weight=data["tare_weight"],
            gross_weight=data["gross_weight"],
            unit=data["unit"],
            status=data["status"],
            filter_level=data["filter_level"],
            digital_output_status=data["digital_output_status"],
        )

        db.session.add(new_entry)
        db.session.commit()

        return weight_schema.jsonify(new_entry), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# GET: Fetch all weight entries
@weight_bp.route("/weights", methods=["GET"])
def get_weight_entries():
    entries = WeightEntry.query.order_by(WeightEntry.timestamp.desc()).all()
    return weights_schema.jsonify(entries), 200
