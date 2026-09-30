from typing import Optional
from fastapi import APIRouter, Depends, Header
from app.models.agent import (
    AgentListItemResponse,
    AgentDetailResponse,
)
from app.models.upvote import UpvoteRequest, UpvoteResponse
from app.services.agent_service import AgentService
from app.dependencies import get_agent_service

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[AgentListItemResponse])
def list_agents(
    q: Optional[str] = None,
    category: Optional[str] = None,
    runtime: Optional[str] = None,
    monetization: Optional[str] = None,
    sort: Optional[str] = "trending",
    service: AgentService = Depends(get_agent_service),
) -> list[AgentListItemResponse]:
    return service.list_agents(
        q=q,
        category=category,
        runtime=runtime,
        monetization=monetization,
        sort_by=sort or "trending",
    )


@router.get("/{slug}", response_model=AgentDetailResponse)
def get_agent_profile(
    slug: str,
    service: AgentService = Depends(get_agent_service),
) -> AgentDetailResponse:
    return service.get_agent_by_slug(slug)


@router.get("/{slug}/alternatives", response_model=list[AgentListItemResponse])
def get_contextual_alternatives(
    slug: str,
    service: AgentService = Depends(get_agent_service),
) -> list[AgentListItemResponse]:
    return service.get_alternatives(slug=slug, limit=4)


@router.post("/{agent_id}/upvote", response_model=UpvoteResponse)
def toggle_upvote(
    agent_id: str,
    body: Optional[UpvoteRequest] = None,
    x_fingerprint: Optional[str] = Header(None, alias="X-Fingerprint"),
    service: AgentService = Depends(get_agent_service),
) -> UpvoteResponse:
    fingerprint = None
    if body and body.digital_fingerprint_hash:
        fingerprint = body.digital_fingerprint_hash
    elif x_fingerprint:
        fingerprint = x_fingerprint
    else:
        fingerprint = "anonymous-client"

    return service.toggle_upvote(
        agent_id=agent_id,
        user_id=None,
        fingerprint=fingerprint,
    )

