from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from app.models.review import ReviewInDb
from app.utils.json_store import read_list_file, write_list_file


def _to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class ReviewRepository:
    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path

    def get_by_agent_id(self, agent_id: str) -> list[ReviewInDb]:
        reviews = read_list_file(self.file_path, ReviewInDb)
        agent_reviews = [r for r in reviews if r.agent_id == agent_id]
        return sorted(agent_reviews, key=lambda r: _to_utc(r.created_at), reverse=True)

    def create(self, review: ReviewInDb) -> ReviewInDb:
        reviews = read_list_file(self.file_path, ReviewInDb)
        reviews.append(review)
        write_list_file(self.file_path, reviews)
        return review
