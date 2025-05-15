from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from extensions import db  # Adjust this import if needed


class ScaleData(db.Model):
    __tablename__ = "scale_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    weight = Column(Integer, nullable=False)
    error_code = Column(Integer, nullable=False)
    error_message = Column(String(255), nullable=True)
