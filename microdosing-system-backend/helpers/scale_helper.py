from models.scale_data import ScaleData
from extensions import db


def save_scale_data(weight, error_code, error_message):
    """
    Save one record into the scale_data table.
    """
    scale_entry = ScaleData(
        weight=weight, error_code=error_code, error_message=error_message
    )
    db.session.add(scale_entry)
    db.session.commit()
