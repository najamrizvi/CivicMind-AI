from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ComplaintCreate(BaseModel):
    complaint_text: str


class ComplaintResponse(BaseModel):
    id: int
    complaint_text: str
    category: str | None
    priority: str | None
    department: str | None
    status: str
    receipt_number: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )