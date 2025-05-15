from extensions import db

class SMTPProfile(db.Model):
    __tablename__ = "smtp_profiles"

    smtp_profile_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    host = db.Column(db.String(100), nullable=False)
    port = db.Column(db.Integer, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    sender = db.Column(db.String(100), nullable=False)
    active = db.Column(db.Boolean, nullable=False, default=False)