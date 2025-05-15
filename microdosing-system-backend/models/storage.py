from extensions import db, ma
from datetime import datetime


class StorageBucket(db.Model):
    __tablename__ = "storage_bucket"  # Ensure this is the correct table name

    bucket_id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.String(100), nullable=False)

    material_id = db.Column(
        db.Integer, db.ForeignKey("material.material_id"), nullable=False
    )

    barcode = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())

    material = db.relationship("Material", backref="storage_buckets")


class StorageBucketSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = StorageBucket
        load_instance = True
        include_fk = True  # 👈 Ensures foreign keys like material_id are included
