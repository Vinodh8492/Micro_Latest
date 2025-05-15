from extensions import db, ma
from datetime import datetime


class WeightEntry(db.Model):
    __tablename__ = "weight_entry"

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    current_weight = db.Column(db.Float, nullable=False)
    tare_weight = db.Column(db.Float, nullable=False)
    gross_weight = db.Column(db.Float, nullable=False)
    unit = db.Column(db.Integer, nullable=False)  # 0 = kg, 1 = lb
    status = db.Column(db.Integer, nullable=False)  # 0 = Stable, 1 = Unstable
    filter_level = db.Column(db.Integer, nullable=False)
    digital_output_status = db.Column(db.String(10), nullable=False)


class WeightEntrySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = WeightEntry
        load_instance = True
