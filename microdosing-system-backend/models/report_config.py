from extensions import db

class ReportConfig(db.Model):
    __tablename__ = "report_configs"

    report_id = db.Column(db.Integer, primary_key=True)
    enabled = db.Column(db.Boolean, default=False, nullable=False)
    sender = db.Column(db.String(100), nullable=False)
    recipient = db.Column(db.String(100), nullable=False)
    time = db.Column(db.String(50), nullable=False)  # Store time as string (e.g., "09:00 AM")

    # Fields for selected items
    include_kpis = db.Column(db.Boolean, default=True)
    include_charts = db.Column(db.Boolean, default=True)
    include_table = db.Column(db.Boolean, default=True)
