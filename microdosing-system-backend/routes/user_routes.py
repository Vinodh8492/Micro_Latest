from flask import Blueprint, request, jsonify, current_app, make_response  # type: ignore
from models.user import db, User  # ✅ Avoid circular imports
from werkzeug.security import generate_password_hash, check_password_hash  # type: ignore
import jwt  # type: ignore
import datetime
from sqlalchemy.exc import SQLAlchemyError  # type: ignore
from functools import wraps
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_access_token, set_access_cookies, get_csrf_token, unset_jwt_cookies  # type: ignore

user_bp = Blueprint("user", __name__)


@user_bp.route("/protected", methods=["GET"])
@jwt_required(locations=["cookies"])  # Read from cookies instead of headers
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": "Access granted", "user": current_user}), 200


### ✅ ROLE-BASED ACCESS DECORATOR ###
def role_required(allowed_roles):
    """Restrict access based on user roles stored in the database."""

    def wrapper(fn):
        @wraps(fn)
        def decorated_function(*args, **kwargs):
            try:
                user_id = get_jwt_identity()
                user = User.query.get(user_id)

                if not user:
                    return jsonify({"error": "User not found"}), 404

                if user.role not in allowed_roles:
                    return jsonify({"error": "Unauthorized access"}), 403

                return fn(*args, **kwargs)
            except Exception as e:
                return (
                    jsonify({"error": "Authentication failed", "details": str(e)}),
                    401,
                )

        return decorated_function

    return wrapper


### 🚀 CREATE USER ###
@user_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()

    # Ensure all required fields are present
    if not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "All fields are required"}), 400

    # Check if username or email already exists
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already taken"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400

    # Create a new user with a default role of "operator"
    new_user = User(
        username=data["username"],
        full_name=data.get("full_name", "").strip(),  # Handle optional field safely
        email=data["email"],
        password_hash=generate_password_hash(data["password"], method="pbkdf2:sha256"),
        role=data.get("role", "operator"),  # Use 'operator' only if not provided
        status="active",
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully!"}), 201


### 🚀 GET ALL USERS ###
@user_bp.route("/users", methods=["GET"])
@jwt_required()
@role_required(["admin"])  # ✅ Only admin can view all users
def get_users():
    users = User.query.all()
    result = [
        {
            "user_id": user.user_id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
        }
        for user in users
    ]
    return jsonify(result)


### 🚀 GET USER BY ID ###
@user_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(
            {
                "user_id": user.user_id,
                "username": user.username,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "status": user.status,
            }
        )
    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500
    except Exception as e:
        return (
            jsonify({"error": "An unexpected error occurred", "details": str(e)}),
            500,
        )


### 🚀 UPDATE USER ###
@user_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin"])  # ✅ Only admin can update users
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    user.full_name = data.get("full_name", user.full_name)
    user.role = data.get("role", user.role)
    user.status = data.get("status", user.status)

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200


### 🚀 DELETE USER ###
@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required(locations=["cookies", "headers"])  # ✅ Read JWT from cookies
def delete_user(user_id):
    current_user_id = get_jwt_identity()

    # Convert user_id to integer
    try:
        current_user_id = int(current_user_id)
    except ValueError:
        return jsonify({"message": "Invalid token format"}), 400

    # Debugging
    print(
        f"Debug: Current User ID -> {current_user_id}, Type -> {type(current_user_id)}"
    )

    # Fetch user from database
    user = User.query.get(current_user_id)

    if not user or user.role != "admin":
        return jsonify({"message": "Unauthorized: Admins only"}), 403

    user_to_delete = User.query.get(user_id)

    if not user_to_delete:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user_to_delete)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200


### 🚀 USER LOGIN ###
@user_bp.route("/users/login", methods=["POST"])
def login_user():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter(User.email.ilike(data["email"])).first()

    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    # ✅ Store only user_id as identity (string format)
    access_token = create_access_token(identity=str(user.user_id))

    # ✅ Create Response and Set Cookie
    response = make_response(
        jsonify(
            {
                "message": "Login successful",
                "access_token": access_token,
                "user": {
                    "user_id": user.user_id,
                    "email": user.email,
                    "role": user.role,
                },
            }
        )
    )
    set_access_cookies(response, access_token)  # ✅ Set token in cookies

    return response, 200


@user_bp.route("/users/logout", methods=["POST"])
def logout_user():
    response = make_response(jsonify({"message": "Logout successful"}))
    unset_jwt_cookies(response)  # ✅ Clears JWT from cookies
    return response, 200
