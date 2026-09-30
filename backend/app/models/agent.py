from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class AgentInDb(BaseModel):
    id: str = Field(..., description="UUID")
    slug: str = Field(..., max_length=120)
    title: str = Field(..., max_length=150)
    tagline: str = Field(..., max_length=255)
    summary: str = Field(..., max_length=120)
    description_markdown: str
    logo_url: str
    website_url: str
    repository_url: Optional[str] = None
    github_stars: int = Field(default=0)
    category_id: str
    deployment_targets: list[str] = Field(default_factory=list)
    llm_backends: list[str] = Field(default_factory=list)
    framework: Optional[str] = None
    is_open_source: bool = False
    is_mcp_compliant: bool = False
    hardware_requirements: Optional[str] = None
    terminal_setup_script: Optional[str] = None
    strengths: list[str] = Field(default_factory=list)
    known_edge_cases: list[str] = Field(default_factory=list)
    upvotes_count: int = Field(default=0)
    lifecycle_state: str = Field(default="approved")
    is_archived: bool = False
    submitter_email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Benchmark & Comparison attributes
    autonomy_level: str = Field(default="fully_autonomous")
    has_vector_rag: bool = False
    memory_backend: Optional[str] = None
    multimodal_capabilities: list[str] = Field(default_factory=list)
    token_overhead_tier: str = Field(default="moderate")
    maintenance_cadence: str = Field(default="weekly_releases")

    @field_validator("title", "tagline", "summary", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v


class AgentListItemResponse(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str
    summary: str
    logo_url: str
    website_url: str
    repository_url: Optional[str] = None
    github_stars: int
    category_id: str
    deployment_targets: list[str]
    llm_backends: list[str]
    framework: Optional[str] = None
    is_open_source: bool
    is_mcp_compliant: bool
    upvotes_count: int
    lifecycle_state: str
    is_archived: bool
    created_at: datetime
    ranking_score: float = 0.0


class AgentDetailResponse(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str
    summary: str
    description_markdown: str
    logo_url: str
    website_url: str
    repository_url: Optional[str] = None
    github_stars: int
    category_id: str
    category_title: Optional[str] = None
    deployment_targets: list[str]
    llm_backends: list[str]
    framework: Optional[str] = None
    is_open_source: bool
    is_mcp_compliant: bool
    hardware_requirements: Optional[str] = None
    terminal_setup_script: Optional[str] = None
    strengths: list[str]
    known_edge_cases: list[str]
    upvotes_count: int
    lifecycle_state: str
    is_archived: bool
    created_at: datetime
    ranking_score: float = 0.0
    autonomy_level: str
    has_vector_rag: bool
    memory_backend: Optional[str] = None
    multimodal_capabilities: list[str]
    token_overhead_tier: str
    maintenance_cadence: str


class AgentCatalogQuery(BaseModel):
    q: Optional[str] = None
    category: Optional[str] = None
    runtime: Optional[str] = None
    monetization: Optional[str] = None
    sort: Optional[str] = "trending"  # trending, top, stars, newest

