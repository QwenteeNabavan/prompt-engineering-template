from functools import lru_cache
from fastapi import Depends

from app.repositories.category_repository import CategoryRepository
from app.repositories.agent_repository import AgentRepository
from app.repositories.upvote_repository import UpvoteRepository
from app.repositories.collection_repository import CollectionRepository
from app.repositories.review_repository import ReviewRepository

from app.services.agent_service import AgentService
from app.services.submission_service import SubmissionService
from app.services.collection_service import CollectionService
from app.services.sync_service import SyncService
from app.services.review_service import ReviewService

from app.utils.paths import get_data_dir


@lru_cache
def get_category_repository() -> CategoryRepository:
    return CategoryRepository(get_data_dir() / "categories.json")


@lru_cache
def get_agent_repository() -> AgentRepository:
    return AgentRepository(get_data_dir() / "agents.json")


@lru_cache
def get_upvote_repository() -> UpvoteRepository:
    return UpvoteRepository(get_data_dir() / "upvotes.json")


@lru_cache
def get_collection_repository() -> CollectionRepository:
    return CollectionRepository(get_data_dir() / "collections.json")


@lru_cache
def get_review_repository() -> ReviewRepository:
    return ReviewRepository(get_data_dir() / "reviews.json")


def get_agent_service(
    agent_repo: AgentRepository = Depends(get_agent_repository),
    category_repo: CategoryRepository = Depends(get_category_repository),
    upvote_repo: UpvoteRepository = Depends(get_upvote_repository),
) -> AgentService:
    return AgentService(
        agent_repo=agent_repo,
        category_repo=category_repo,
        upvote_repo=upvote_repo,
    )


def get_submission_service(
    agent_repo: AgentRepository = Depends(get_agent_repository),
    category_repo: CategoryRepository = Depends(get_category_repository),
) -> SubmissionService:
    return SubmissionService(
        agent_repo=agent_repo,
        category_repo=category_repo,
    )


def get_collection_service(
    collection_repo: CollectionRepository = Depends(get_collection_repository),
    agent_repo: AgentRepository = Depends(get_agent_repository),
    category_repo: CategoryRepository = Depends(get_category_repository),
) -> CollectionService:
    return CollectionService(
        collection_repo=collection_repo,
        agent_repo=agent_repo,
        category_repo=category_repo,
    )


def get_sync_service(
    agent_repo: AgentRepository = Depends(get_agent_repository),
) -> SyncService:
    return SyncService(agent_repo=agent_repo)


def get_review_service(
    review_repo: ReviewRepository = Depends(get_review_repository),
    agent_repo: AgentRepository = Depends(get_agent_repository),
) -> ReviewService:
    return ReviewService(
        review_repo=review_repo,
        agent_repo=agent_repo,
    )
