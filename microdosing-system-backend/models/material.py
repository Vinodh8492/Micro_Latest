from extensions import db, ma  # ✅ Import from extensions


class Material(db.Model):
    material_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    unit_of_measure = db.Column(
        db.Enum("Kilogram (kg)", "Gram (g)", "Milligram (mg)", name="unit_enum"),
        nullable=False,
    )
    current_quantity = db.Column(db.Numeric(10, 2), nullable=False)
    minimum_quantity = db.Column(db.Numeric(10, 2), nullable=False)
    maximum_quantity = db.Column(db.Numeric(10, 2), nullable=False)
    plant_area_location = db.Column(db.String(50), nullable=True)
    barcode_id = db.Column(
        db.String(50), unique=True, nullable=True, index=True
    )  # <-- add index
    status = db.Column(
        db.Enum("Released", "Unreleased", name="status_enum"),
        nullable=False,
        default="Unreleased",
        index=True,  # <-- add index
    )
    supplier = db.Column(db.String(100), nullable=True)
    supplier_contact_info = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    transactions = db.relationship(
        "MaterialTransaction", backref="material", cascade="all, delete", lazy=True
    )
    margin = db.Column(db.Numeric(5, 2), nullable=True)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )


class MaterialTransaction(db.Model):
    transaction_id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(
        db.Integer, db.ForeignKey("material.material_id"), nullable=False, index=True
    )  # <-- add index
    transaction_type = db.Column(db.Enum("addition", "removal"), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    transaction_date = db.Column(
        db.TIMESTAMP, server_default=db.func.current_timestamp()
    )
    description = db.Column(db.Text, nullable=True)


class MaterialSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Material


class MaterialTransactionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = MaterialTransaction
