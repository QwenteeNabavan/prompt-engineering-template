from datetime import datetime
import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class SubmissionCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    tagline: str = Field(..., min_length=5, max_length=255)
    summary: str = Field(..., max_length=120, description="Directory preview snippet (capped at 120 chars)")
    description_markdown: str = Field(..., min_length=20)
    website_url: str = Field(..., description="HTTPS landing page URL")
    repository_url: Optional[str] = None
    category_id: str
    deployment_targets: list[str] = Field(default_factory=list)
    llm_backends: list[str] = Field(default_factory=list)
    framework: Optional[str] = None
    is_open_source: bool = False
    is_mcp_compliant: bool = False
    hardware_requirements: Optional[str] = None
    terminal_setup_script: Optional[str] = None
    logo_url: str = Field(..., description="Square logo asset URL")
    submitter_email: str
    bot_token: Optional[str] = Field(None, description="Background bot defense verification token")

    @field_validator("title", "tagline", "summary", mode="before")
    @classmethod
    def strip_text(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("submitter_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("website_url", "repository_url", mode="before")
    @classmethod
    def validate_url_protocol(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("URL must start with https:// or http://")
        return v


class SubmissionResponse(BaseModel):
    submission_id: str
    slug: str
    title: str
    status: str
    sla_hours: int = 12
    submitted_at: datetime
    message: str

