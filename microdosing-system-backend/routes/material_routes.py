from flask import Blueprint, request, jsonify, send_file, current_app
from extensions import db
from models.material import (
    Material,
    MaterialTransaction,
    MaterialSchema,
    MaterialTransactionSchema,
)
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from marshmallow import ValidationError
from openpyxl import Workbook
from openpyxl.drawing.image import Image as ExcelImage
from barcode import Code128
from barcode.writer import ImageWriter
from PIL import Image as PILImage
import io, os, tempfile, time, logging
from functools import wraps

material_bp = Blueprint("materials", __name__)

# Initialize schemas
material_schema = MaterialSchema()
materials_schema = MaterialSchema(many=True)
transaction_schema = MaterialTransactionSchema()
transactions_schema = MaterialTransactionSchema(many=True)

# Setup logger
logger = logging.getLogger("material_routes")

# Timing decorators
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        response = func(*args, **kwargs)
        duration = time.time() - start_time
        logger.info(
            f"{request.method} {request.path} completed in {duration:.4f} seconds"
        )
        return response

    wrapper.__name__ = func.__name__
    return wrapper


@material_bp.route("/materials/export/barcodes", methods=["GET"])
@timing_decorator
def export_materials_excel_with_barcodes():
    try:
        materials = Material.query.with_entities(
            Material.title, Material.barcode_id
        ).all()
        wb = Workbook()
        ws = wb.active
        ws.title = "Material Barcodes"
        ws.append(["Title", "Barcode ID", "Scannable Barcode"])

        temp_dir = tempfile.gettempdir()
        row_number = 2

        for material in materials:
            if material.barcode_id:
                try:
                    barcode_path = os.path.join(temp_dir, f"{material.barcode_id}.png")
                    code128 = Code128(material.barcode_id, writer=ImageWriter())
                    code128.save(os.path.join(temp_dir, material.barcode_id))

                    image = PILImage.open(barcode_path)
                    image = image.resize((200, 60))
                    image.save(barcode_path)

                    ws.cell(row=row_number, column=1, value=material.title)
                    ws.cell(row=row_number, column=2, value=material.barcode_id)
                    img = ExcelImage(barcode_path)
                    img.width = 150
                    img.height = 50
                    ws.add_image(img, f"C{row_number}")

                    os.remove(barcode_path)
                    row_number += 1
                except Exception as e:
                    logger.error(
                        f"Barcode generation failed for {material.barcode_id}: {e}"
                    )

        stream = io.BytesIO()
        wb.save(stream)
        stream.seek(0)

        return send_file(
            stream,
            download_name="materials_with_barcodes.xlsx",
            as_attachment=True,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    except Exception as e:
        logger.exception("Failed to export materials")
        return jsonify({"error": str(e)}), 500


@material_bp.route("/active-material", methods=["GET"])
@timing_decorator  # <-- Added timing decorator here
def get_active_material():
    try:
        active_material = Material.query.filter_by(status="Released").first()

        if not active_material:
            logging.warning("No released material found.")
            return jsonify({"message": "No released material found."}), 404

        material_data = {
            "material_id": active_material.material_id,
            "title": active_material.title,
            "description": active_material.description,
            "unit_of_measure": active_material.unit_of_measure,
            "current_quantity": str(active_material.current_quantity),
            "minimum_quantity": str(active_material.minimum_quantity),
            "maximum_quantity": str(active_material.maximum_quantity),
            "plant_area_location": active_material.plant_area_location,
            "barcode_id": active_material.barcode_id,
            "status": active_material.status,
            "supplier": active_material.supplier,
            "supplier_contact_info": active_material.supplier_contact_info,
            "notes": active_material.notes,
            "created_at": active_material.created_at,
            "updated_at": active_material.updated_at,
            "margin": f"{active_material.margin}%",
        }

        return jsonify(material_data), 200

    except SQLAlchemyError as e:
        logging.error(f"Database error while fetching released material: {str(e)}")
        return (
            jsonify(
                {"error": "Internal server error. Could not fetch released material."}
            ),
            500,
        )

    except Exception as e:
        logging.exception(f"Unexpected error occurred: {str(e)}")
        return jsonify({"error": "An unexpected error occurred."}), 500


@material_bp.route("/materials", methods=["POST"])
@timing_decorator
def add_material():
    try:
        data = material_schema.load(request.get_json())

        margin = 0.0
        if data.get("maximum_quantity") and data.get("current_quantity"):
            margin = round(
                (
                    (float(data["maximum_quantity"]) - float(data["current_quantity"]))
                    / float(data["maximum_quantity"])
                )
                * 100,
                2,
            )

        new_material = Material(**data, margin=margin)
        db.session.add(new_material)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Material added successfully",
                    "material": material_schema.dump(new_material),
                }
            ),
            201,
        )

    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error on add_material: {e}")
        return jsonify({"error": "Database error."}), 500


@material_bp.route("/materials", methods=["GET"])
@timing_decorator
def get_materials():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)

    materials = Material.query.paginate(page=page, per_page=limit, error_out=False)

    return (
        jsonify(
            {
                "materials": materials_schema.dump(materials.items),
                "total": materials.total,
                "page": materials.page,
                "limit": limit,
            }
        ),
        200,
    )


@material_bp.route("/materials/<int:material_id>", methods=["GET"])
@timing_decorator
def get_material(material_id):
    material = Material.query.get(material_id)
    if not material:
        return jsonify({"message": "Material not found"}), 404
    return jsonify(material_schema.dump(material)), 200


@material_bp.route("/materials/<int:material_id>", methods=["PUT"])
@timing_decorator
def update_material(material_id):
    material = Material.query.get(material_id)
    if not material:
        return jsonify({"message": "Material not found"}), 404

    try:
        data = material_schema.load(request.get_json(), partial=True)
        for key, value in data.items():
            setattr(material, key, value)

        db.session.commit()
        return jsonify(material_schema.dump(material)), 200
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error on update_material: {e}")
        return jsonify({"error": "Database error."}), 500


@material_bp.route("/materials/<int:material_id>", methods=["DELETE"])
@timing_decorator
def delete_material(material_id):
    try:
        material = Material.query.get(material_id)
        if not material:
            return jsonify({"error": "Material not found"}), 404

        db.session.delete(material)
        db.session.commit()

        return jsonify({"message": "Material deleted successfully."}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error on delete_material: {e}")
        return jsonify({"error": "Database error."}), 500


@material_bp.route("/material-transactions", methods=["POST"])
@timing_decorator
def create_material_transaction():
    try:
        data = transaction_schema.load(request.get_json())

        new_transaction = MaterialTransaction(**data)
        db.session.add(new_transaction)
        db.session.commit()

        return jsonify(transaction_schema.dump(new_transaction)), 201
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error on create_material_transaction: {e}")
        return jsonify({"error": "Database error."}), 500


@material_bp.route("/material-transactions", methods=["GET"])
@timing_decorator
def get_material_transactions():
    transactions = MaterialTransaction.query.all()
    return jsonify(transactions_schema.dump(transactions)), 200


@material_bp.route("/material-transactions/<int:transaction_id>", methods=["GET"])
@timing_decorator
def get_material_transaction(transaction_id):
    transaction = MaterialTransaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"message": "Transaction not found"}), 404
    return jsonify(transaction_schema.dump(transaction)), 200
