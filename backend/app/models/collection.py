from datetime import datetime
from pydantic import BaseModel, Field
from app.models.agent import AgentListItemResponse


class CollectionInDb(BaseModel):
    id: str = Field(..., description="UUID")
    slug: str = Field(..., max_length=100)
    title: str = Field(..., max_length=150)
    editorial_summary: str
    content_markdown: str
    featured_agent_ids: list[str] = Field(default_factory=list)
    is_published: bool = True
    display_order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CollectionResponse(BaseModel):
    id: str
    slug: str
    title: str
    editorial_summary: str
    content_markdown: str
    featured_agents: list[AgentListItemResponse]
    display_order: int


class AgentComparisonItem(BaseModel):
    id: str
    slug: str
    title: str
    tagline: str
    logo_url: str
    category_title: str
    framework: str | None
    is_open_source: bool
    is_mcp_compliant: bool
    github_stars: int
    upvotes_count: int
    autonomy_level: str
    has_vector_rag: bool
    memory_backend: str | None
    multimodal_capabilities: list[str]
    token_overhead_tier: str
    maintenance_cadence: str
    strengths: list[str]
    known_edge_cases: list[str]


class ComparisonMatrixResponse(BaseModel):
    agents: list[AgentComparisonItem]
    comparison_parameters: list[str]
    is_cross_category: bool

