from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_complaints: int
    open_complaints: int
    resolved_complaints: int
    closed_complaints: int
    high_priority_complaints: int


class AnalyticsResponse(BaseModel):
    overview: AnalyticsOverview
    by_status: dict[str, int]
    by_priority: dict[str, int]
    by_category: dict[str, int]
    by_department: dict[str, int]