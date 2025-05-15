from extensions import db, ma  # ✅ Import from extensions
from models.user import User  # ✅ Import the User model for relationship


class ProductionOrder(db.Model):
    __tablename__ = "production_order"

    order_id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)

    # ForeignKey to Recipe table
    recipe_id = db.Column(
        db.Integer,
        db.ForeignKey("recipe.recipe_id", ondelete="CASCADE"),
        nullable=False,
    )
    recipe = db.relationship(
        "Recipe", backref="production_orders"
    )  # Relationship to Recipe table

    batch_size = db.Column(db.Numeric(10, 2), nullable=False)
    scheduled_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default="planned")

    # ForeignKey to User table (for the creator of the order)
    created_by = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)

    # ✅ Add this relationship to access user info
    creator = db.relationship("User", backref="production_orders_created")

    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    notes = db.Column(db.Text, nullable=True)
    barcode_id = db.Column(db.String(100), unique=True, nullable=True)


class Batch(db.Model):
    __tablename__ = "batch"

    batch_id = db.Column(db.Integer, primary_key=True)
    batch_number = db.Column(db.String(50), unique=True, nullable=False)
    order_id = db.Column(
        db.Integer, db.ForeignKey("production_order.order_id"), nullable=False
    )
    start_time = db.Column(db.TIMESTAMP, nullable=True)
    end_time = db.Column(db.TIMESTAMP, nullable=True)

    status = db.Column(
        db.Enum("Released", "Unreleased", name="batch_status_enum"),
        nullable=False,
        default="unreleased",
    )

    operator_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )


class BatchMaterialDispensing(db.Model):
    __tablename__ = "batch_material_dispensing"

    dispensing_id = db.Column(db.Integer, primary_key=True)
    batch_id = db.Column(db.Integer, db.ForeignKey("batch.batch_id"), nullable=False)
    material_id = db.Column(
        db.Integer, db.ForeignKey("material.material_id"), nullable=False
    )
    planned_quantity = db.Column(db.Numeric(10, 2), nullable=False)
    actual_quantity = db.Column(db.Numeric(10, 2), nullable=True)
    dispensed_by = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    dispensed_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    status = db.Column(
        db.Enum("pending", "dispensed", "verified"), nullable=False, default="pending"
    )
    batch = db.relationship(
        "Batch", backref="batch_material_dispensings", passive_deletes=True
    )


# Ensure MaterialTransaction is defined or imported correctly
try:
    from models.material import MaterialTransaction

    print("MaterialTransaction imported successfully.")
except ImportError:
    print("Error: Could not import MaterialTransaction.")
