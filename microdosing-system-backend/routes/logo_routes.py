import os
from flask import Blueprint, request, send_file, jsonify
from werkzeug.utils import secure_filename
from extensions import db
from models.logo import Logo

logo_bp = Blueprint('logo', __name__)


UPLOAD_FOLDER = 'static/uploads'  # Make sure this path exists
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to get the current logo
@logo_bp.route('/logo', methods=['GET'])  # This should be accessible at /api/logo
def get_logo():
    logo_path = os.path.join(UPLOAD_FOLDER, 'current_logo.png')
    if os.path.exists(logo_path):
        return send_file(logo_path, mimetype='image/png')
    return jsonify({'error': 'Logo not found'}), 404

@logo_bp.route('/logo', methods=['POST'])   
def upload_logo():
    try:
        print('Received logo upload request')
        if 'logo' not in request.files:
            print('No logo file provided')
            return jsonify({"error": "No logo file provided"}), 400
        file = request.files['logo']
        print(f'File received: {file.filename}')
        if file.filename == '':
            print('Empty file name')
            return jsonify({"error": "Empty file name"}), 400
        if file and allowed_file(file.filename):
            filename = 'current_logo.png'
            logo_path = os.path.join(UPLOAD_FOLDER, filename)
            print(f'Saving file to: {logo_path}')
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(logo_path)
            print('File saved successfully')
            # Clear old DB records
            Logo.query.delete()
            db.session.commit()
            print('Old logo records deleted')
            # Save filename in DB
            new_logo = Logo(filename=filename)
            db.session.add(new_logo)
            db.session.commit()
            print('New logo record added to DB')
            return jsonify({"message": "Logo uploaded successfully", "logoUrl": f"/static/uploads/{filename}"}), 200
        print('Invalid file type')
        return jsonify({"error": "Invalid file type. Only PNG, JPG, JPEG, GIF are allowed."}), 400
    except Exception as e:
        print(f'Error during logo upload: {e}')
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

