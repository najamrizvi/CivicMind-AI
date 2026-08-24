from pydantic import BaseModel


class InsightItem(BaseModel):
    type: str
    severity: str
    title: str
    message: str
    reason: str
    recommendation: str


class InsightsResponse(BaseModel):
    summary: str
    insights: list[InsightItem]