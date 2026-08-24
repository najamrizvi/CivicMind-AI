from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    complaint_text = Column(
        Text,
        nullable=False,
    )

    category = Column(
        String(100),
        nullable=True,
    )

    priority = Column(
        String(50),
        nullable=True,
    )

    department = Column(
        String(150),
        nullable=True,
    )

    status = Column(
        String(50),
        default="submitted",
        nullable=False,
    )

    receipt_number = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )