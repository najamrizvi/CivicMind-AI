from pydantic import BaseModel

class ComplaintStatusUpdate(BaseModel):
    status: str
    note: str | None = None
