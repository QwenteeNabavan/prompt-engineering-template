from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator


class ReviewInDb(BaseModel):
    id: str = Field(..., description="UUID")
    agent_id: str
    author_name: str = Field(..., max_length=100)
    author_role: str = Field(..., max_length=100, description="e.g. Senior AI Engineer")
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=10, max_length=1000)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("author_name", "author_role", "comment", mode="before")
    @classmethod
    def strip_text(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v


class ReviewCreateRequest(BaseModel):
    author_name: str = Field(..., min_length=2, max_length=100)
    author_role: str = Field(default="AI Developer", max_length=100)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=10, max_length=1000)


class ReviewResponse(BaseModel):
    id: str
    agent_id: str
    author_name: str
    author_role: str
    rating: int
    comment: str
    created_at: datetime
