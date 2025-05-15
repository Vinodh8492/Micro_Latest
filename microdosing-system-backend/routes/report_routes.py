from flask import Blueprint, request, jsonify
from extensions import db
from models.report_config import ReportConfig  # Adjust path as needed

report_bp = Blueprint('report_configs', __name__)

# Create or update report config
@report_bp.route('/settings/report-config', methods=['POST'])
def save_report_config():
    data = request.get_json()
    
    # If you want to always overwrite a single report config (optional)
    existing = ReportConfig.query.first()
    
    if existing:
        for key, value in data.items():
            if key == "include":
                existing.include_kpis = data["include"].get("kpis", True)
                existing.include_charts = data["include"].get("charts", True)
                existing.include_table = data["include"].get("table", True)
            else:
                setattr(existing, key, value)
    else:
        new_config = ReportConfig(
            enabled=data.get("enabled", False),
            sender=data["sender"],
            recipient=data["recipient"],
            time=data["time"],
            include_kpis=data["include"].get("kpis", True),
            include_charts=data["include"].get("charts", True),
            include_table=data["include"].get("table", True),
        )
        db.session.add(new_config)

    db.session.commit()
    return jsonify({"message": "Report config saved successfully"}), 200

# Get report config
@report_bp.route('/settings/report-config', methods=['GET'])
def get_report_config():
    config = ReportConfig.query.first()
    
    if not config:
        # Return default config structure if none found
        return jsonify({
            "enabled": False,
            "sender": "",
            "recipient": "",
            "time": "09:00",
            "include": {
                "kpis": True,
                "charts": True,
                "table": True
            }
        }), 200

    return jsonify({
        "enabled": config.enabled,
        "sender": config.sender,
        "recipient": config.recipient,
        "time": config.time,
        "include": {
            "kpis": config.include_kpis,
            "charts": config.include_charts,
            "table": config.include_table,
        }
    }), 200
