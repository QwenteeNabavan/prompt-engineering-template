from fastapi import APIRouter, Depends
from app.models.category import CategoryResponse
from app.repositories.category_repository import CategoryRepository
from app.dependencies import get_category_repository

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    repo: CategoryRepository = Depends(get_category_repository),
) -> list[CategoryResponse]:
    categories = repo.get_all()
    return [
        CategoryResponse(
            id=c.id,
            slug=c.slug,
            title=c.title,
            description=c.description,
            icon_token=c.icon_token,
            display_order=c.display_order,
        )
        for c in categories
    ]

