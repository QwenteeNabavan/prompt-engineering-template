from fastapi import APIRouter, Depends, status
from app.models.submission import (
    SubmissionCreateRequest,
    SubmissionResponse,
)
from app.services.submission_service import SubmissionService
from app.dependencies import get_submission_service

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post(
    "", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED
)
def submit_agent(
    payload: SubmissionCreateRequest,
    service: SubmissionService = Depends(get_submission_service),
) -> SubmissionResponse:
    return service.submit_agent(payload)

