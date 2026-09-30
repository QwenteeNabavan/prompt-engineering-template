from fastapi import APIRouter, Depends, Query
from app.models.collection import (
    CollectionResponse,
    ComparisonMatrixResponse,
)
from app.services.collection_service import CollectionService
from app.dependencies import get_collection_service

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("", response_model=list[CollectionResponse])
def list_collections(
    service: CollectionService = Depends(get_collection_service),
) -> list[CollectionResponse]:
    return service.list_collections()


@router.get("/compare/matrix", response_model=ComparisonMatrixResponse)
def compare_agents(
    agents: str = Query(
        ...,
        description="Comma-separated list of 2 or 3 agent slugs or IDs, e.g. devin,openhands",
    ),
    service: CollectionService = Depends(get_collection_service),
) -> ComparisonMatrixResponse:
    slug_list = [s.strip() for s in agents.split(",") if s.strip()]
    return service.compare_agents(slug_list)


@router.get("/{slug}", response_model=CollectionResponse)
def get_collection(
    slug: str,
    service: CollectionService = Depends(get_collection_service),
) -> CollectionResponse:
    return service.get_collection_by_slug(slug)

