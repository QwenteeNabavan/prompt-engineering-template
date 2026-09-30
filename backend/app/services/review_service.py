from datetime import datetime, timezone
import uuid
from fastapi import HTTPException
from app.models.review import (
    ReviewInDb,
    ReviewCreateRequest,
    ReviewResponse,
)
from app.repositories.agent_repository import AgentRepository
from app.repositories.review_repository import ReviewRepository


class ReviewService:
    def __init__(
        self,
        review_repo: ReviewRepository,
        agent_repo: AgentRepository,
    ) -> None:
        self.review_repo = review_repo
        self.agent_repo = agent_repo

    def list_reviews(self, slug_or_id: str) -> list[ReviewResponse]:
        agent = self.agent_repo.get_by_slug(slug_or_id)
        if not agent:
            agent = self.agent_repo.get_by_id(slug_or_id)
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent '{slug_or_id}' not found")

        records = self.review_repo.get_by_agent_id(agent.id)
        return [
            ReviewResponse(
                id=r.id,
                agent_id=r.agent_id,
                author_name=r.author_name,
                author_role=r.author_role,
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at,
            )
            for r in records
        ]

    def create_review(
        self, agent_id: str, req: ReviewCreateRequest
    ) -> ReviewResponse:
        agent = self.agent_repo.get_by_id(agent_id)
        if not agent:
            agent = self.agent_repo.get_by_slug(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

        record = ReviewInDb(
            id=str(uuid.uuid4()),
            agent_id=agent.id,
            author_name=req.author_name,
            author_role=req.author_role,
            rating=req.rating,
            comment=req.comment,
            created_at=datetime.now(timezone.utc),
        )
        saved = self.review_repo.create(record)

        return ReviewResponse(
            id=saved.id,
            agent_id=saved.agent_id,
            author_name=saved.author_name,
            author_role=saved.author_role,
            rating=saved.rating,
            comment=saved.comment,
            created_at=saved.created_at,
        )
