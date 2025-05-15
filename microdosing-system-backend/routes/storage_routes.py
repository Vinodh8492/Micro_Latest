from flask import Blueprint, request, jsonify
from models.storage import StorageBucket, StorageBucketSchema
from models.material import Material
from extensions import db
import uuid  # Used for generating unique barcodes

storage_bp = Blueprint("storage_bp", __name__)
storage_schema = StorageBucketSchema()
storages_schema = StorageBucketSchema(many=True)

# GET all storage buckets
@storage_bp.route("/storage", methods=["GET"])
def get_all_buckets():
    buckets = StorageBucket.query.all()
    return storages_schema.jsonify(buckets), 200


# GET bucket by barcode
@storage_bp.route("/storage/<string:barcode>", methods=["GET"])
def get_bucket_by_barcode(barcode):
    bucket = StorageBucket.query.filter_by(barcode=barcode).first()
    if not bucket:
        return jsonify({"error": "Bucket not found"}), 404
    return storage_schema.jsonify(bucket), 200


# POST create storage bucket for a material
@storage_bp.route("/storage", methods=["POST"])
def create_buckets():
    data = request.get_json()

    material_id = data.get("material_id")
    location_list = data.get("locations")  # Expecting a list

    if not isinstance(location_list, list) or not location_list:
        return jsonify({"error": "locations must be a non-empty list"}), 400

    # ✅ Validate material exists
    material = Material.query.get(material_id)
    if not material:
        return jsonify({"error": "Material not found in master"}), 404

    created_buckets = []
    for location_id in location_list:
        barcode = f"B-{uuid.uuid4().hex[:10].upper()}"

        new_bucket = StorageBucket(
            location_id=location_id, material_id=material_id, barcode=barcode
        )
        created_buckets.append(new_bucket)

    db.session.add_all(created_buckets)
    db.session.commit()

    return storage_schema.jsonify(created_buckets, many=True), 201


@storage_bp.route("/storage/update/<int:bucket_id>", methods=["PUT"])
def update_bucket_by_id(bucket_id):
    data = request.get_json()

    bucket = StorageBucket.query.get(bucket_id)
    if not bucket:
        return jsonify({"error": "Bucket not found"}), 404

    # Update location_id if provided
    if "location_id" in data:
        bucket.location_id = data["location_id"]

    # Update barcode if provided (check uniqueness)
    if "barcode" in data:
        existing = StorageBucket.query.filter_by(barcode=data["barcode"]).first()
        if existing and existing.bucket_id != bucket_id:
            return jsonify({"error": "Barcode already exists for another bucket"}), 400
        bucket.barcode = data["barcode"]

    db.session.commit()
    return storage_schema.jsonify(bucket), 200


@storage_bp.route("/storage/delete/<int:bucket_id>", methods=["DELETE"])
def delete_bucket_by_id(bucket_id):
    bucket = StorageBucket.query.get(bucket_id)
    if not bucket:
        return jsonify({"error": "Bucket not found"}), 404

    db.session.delete(bucket)
    db.session.commit()

    return jsonify({"message": f"Bucket with ID {bucket_id} deleted successfully"}), 200
