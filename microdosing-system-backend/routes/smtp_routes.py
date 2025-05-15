from flask import Blueprint, request, jsonify
from extensions import db
from models.smtp_profiles import SMTPProfile  # Adjust the path if needed
import smtplib
from email.mime.text import MIMEText

smtp_bp = Blueprint('smtp_profiles', __name__)


# 1. Create a new SMTP profile
@smtp_bp.route('/settings/smtp-profiles', methods=['POST'])
def create_smtp_profile():
    data = request.get_json()
    new_profile = SMTPProfile(**data)
    db.session.add(new_profile)
    db.session.commit()
    return jsonify({"message": "SMTP profile created successfully"}), 201

# 2. Get all SMTP profiles
@smtp_bp.route('/settings/smtp-profiles', methods=['GET'])
def get_smtp_profiles():
    profiles = SMTPProfile.query.all()
    result = [
        {
            "name": p.name,
            "host": p.host,
            "port": p.port,
            "username": p.username,
            "password": p.password,
            "sender": p.sender,
            "active": p.active
            
        }
        for p in profiles
    ]
    return jsonify(result), 200

@smtp_bp.route('/settings/smtp-profiles/activate', methods=['POST'])
def activate_smtp_profile():
    data = request.get_json()
    profile_name = data.get('name')

    if not profile_name:
        return jsonify({"error": "Profile name is required"}), 400

    profile_to_activate = SMTPProfile.query.filter_by(name=profile_name).first()
    if not profile_to_activate:
        return jsonify({"error": "SMTP profile not found"}), 404

    # Set all profiles to inactive
    SMTPProfile.query.update({SMTPProfile.active: False})
    
    # Set the selected one to active
    profile_to_activate.active = True
    db.session.commit()

    return jsonify({"message": f"{profile_name} is now active"}), 200

@smtp_bp.route('/settings/send-test-email', methods=['POST'])
def send_test_email():
    data = request.get_json()
    recipient = data.get('recipient')

    if not recipient:
        return jsonify({'error': 'Recipient email is required'}), 400

    # Get active profile
    active_profile = SMTPProfile.query.filter_by(active=True).first()
    if not active_profile:
        return jsonify({'error': 'No active SMTP profile found'}), 404

    try:
        # Prepare plain text email
        msg = MIMEText("This is a test email from your SMTP profile.")
        msg['Subject'] = "Test Email"
        msg['From'] = active_profile.sender
        msg['To'] = recipient

        # Connect and send
        server = smtplib.SMTP(active_profile.host, active_profile.port)
        server.starttls()
        server.login(active_profile.username, active_profile.password)
        server.sendmail(active_profile.sender, recipient, msg.as_string())
        server.quit()

        return jsonify({'message': 'Test email sent successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# # 3. Get one SMTP profile by name
# @smtp_bp.route('/settings/smtp-profiles/<string:name>', methods=['GET'])
# def get_smtp_profile(name):
#     profile = SMTPProfile.query.filter_by(name=name).first()
#     if not profile:
#         return jsonify({"error": "Profile not found"}), 404
#     return jsonify({
#         "name": profile.name,
#         "host": profile.host,
#         "port": profile.port,
#         "username": profile.username,
#         "password": profile.password,
#         "sender": profile.sender
#     })

# # 4. Update SMTP profile
# @smtp_bp.route('/settings/smtp-profiles/<string:name>', methods=['PUT'])
# def update_smtp_profile(name):
#     profile = SMTPProfile.query.filter_by(name=name).first()
#     if not profile:
#         return jsonify({"error": "Profile not found"}), 404
#     data = request.get_json()
#     for key, value in data.items():
#         setattr(profile, key, value)
#     db.session.commit()
#     return jsonify({"message": "SMTP profile updated successfully"})

# # 5. Delete SMTP profile
# @smtp_bp.route('/settings/smtp-profiles/<string:name>', methods=['DELETE'])
# def delete_smtp_profile(name):
#     profile = SMTPProfile.query.filter_by(name=name).first()
#     if not profile:
#         return jsonify({"error": "Profile not found"}), 404
#     db.session.delete(profile)
#     db.session.commit()
#     return jsonify({"message": "SMTP profile deleted successfully"})
