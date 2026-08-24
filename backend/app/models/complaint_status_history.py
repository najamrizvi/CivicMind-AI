from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database.database import Base


class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id"),
        nullable=False,
        index=True,
    )

    previous_status = Column(
        String(50),
        nullable=True,
    )

    new_status = Column(
        String(50),
        nullable=False,
    )

    changed_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    note = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )