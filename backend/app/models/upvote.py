from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UpvoteRecord(BaseModel):
    id: str = Field(..., description="UUID")
    agent_id: str
    user_id: Optional[str] = None
    digital_fingerprint_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UpvoteRequest(BaseModel):
    digital_fingerprint_hash: Optional[str] = None


class UpvoteResponse(BaseModel):
    success: bool
    agent_id: str
    upvotes_count: int
    has_upvoted: bool
    message: str

