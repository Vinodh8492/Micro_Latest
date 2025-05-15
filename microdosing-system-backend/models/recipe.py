from extensions import db, ma  # ✅ Import from extensions
from models.storage import StorageBucket
from sqlalchemy import Index  # ✅ Needed for adding indexes


class Recipe(db.Model):
    __tablename__ = "recipe"
    __table_args__ = (
        Index("idx_recipe_created_by", "created_by"),  # 📈 Index for created_by
        Index("idx_recipe_status", "status"),  # 📈 Index for status
        Index("idx_recipe_created_at", "created_at"),  # 📈 Index for created_at
        {"extend_existing": True},  # Allow existing table to extend
    )

    recipe_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    version = db.Column(db.String(20), nullable=False)

    status = db.Column(
        db.Enum("Released", "Unreleased", name="recipe_status_enum"),
        nullable=False,
        default="Unreleased",
        server_default="Unreleased",
    )

    created_by = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(
        db.TIMESTAMP,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    barcode_id = db.Column(db.String(100), unique=True, nullable=True)
    no_of_materials = db.Column(db.Integer, nullable=True)
    sequence = db.Column(db.Integer, nullable=True)

    recipe_materials = db.relationship(
        "RecipeMaterial",
        back_populates="recipe",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy=True,
    )


class RecipeMaterial(db.Model):
    __tablename__ = "recipe_material"
    __table_args__ = (
        Index("idx_recipe_material_recipe_id", "recipe_id"),  # 📈 Index for recipe_id
        Index(
            "idx_recipe_material_material_id", "material_id"
        ),  # 📈 Index for material_id
        Index("idx_recipe_material_status", "status"),  # 📈 Index for status
        {"extend_existing": True},
    )

    recipe_material_id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(
        db.Integer, db.ForeignKey("recipe.recipe_id", ondelete="CASCADE"), nullable=True
    )

    material_id = db.Column(
        db.Integer, db.ForeignKey("material.material_id"), nullable=False
    )
    set_point = db.Column(db.Float, nullable=True)
    actual = db.Column(db.Float, nullable=True)

    bucket_id = db.Column(
        db.Integer, db.ForeignKey("storage_bucket.bucket_id"), nullable=True
    )

    status = db.Column(
        db.Enum("pending", "Dosed", "Rejected", name="recipe_material_status"),
        nullable=False,
        default="pending",
        server_default="pending",
    )

    margin = db.Column(db.Float, nullable=True)

    bucket = db.relationship("StorageBucket", backref="recipe_materials")
    material = db.relationship("Material", backref="recipe_materials", lazy=True)
    recipe = db.relationship("Recipe", back_populates="recipe_materials", lazy=True)


class RecipeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Recipe
