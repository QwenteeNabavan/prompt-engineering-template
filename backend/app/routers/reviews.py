from fastapi import APIRouter, Depends, status
from app.models.review import ReviewCreateRequest, ReviewResponse
from app.services.review_service import ReviewService
from app.dependencies import get_review_service

router = APIRouter(prefix="/agents", tags=["reviews"])


@router.get("/{slug}/reviews", response_model=list[ReviewResponse])
def get_agent_reviews(
    slug: str,
    service: ReviewService = Depends(get_review_service),
) -> list[ReviewResponse]:
    return service.list_reviews(slug)


@router.post(
    "/{agent_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_agent_review(
    agent_id: str,
    req: ReviewCreateRequest,
    service: ReviewService = Depends(get_review_service),
) -> ReviewResponse:
    return service.create_review(agent_id, req)
