from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StatusHistoryResponse(BaseModel):
    id: int
    complaint_id: int
    previous_status: str | None
    new_status: str
    changed_by: int | None
    note: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintHistoryResponse(BaseModel):
    complaint_id: int
    history: list[StatusHistoryResponse]