from flask_sqlalchemy import SQLAlchemy  # type: ignore
from flask_marshmallow import Marshmallow  # type: ignore

db = SQLAlchemy()  # Initialize database
ma = Marshmallow()  # Initialize Marshmallow
