from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional
import uuid
from app.models.upvote import UpvoteRecord
from app.utils.json_store import read_list_file, write_list_file


def _to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class UpvoteRepository:
    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path

    def _matches_voter(
        self,
        record: UpvoteRecord,
        user_id: Optional[str],
        fingerprint: Optional[str],
    ) -> bool:
        if user_id and record.user_id == user_id:
            return True
        if fingerprint and record.digital_fingerprint_hash == fingerprint:
            return True
        return False

    def has_upvoted(
        self,
        agent_id: str,
        user_id: Optional[str] = None,
        fingerprint: Optional[str] = None,
    ) -> bool:
        records = read_list_file(self.file_path, UpvoteRecord)
        return any(
            r.agent_id == agent_id and self._matches_voter(r, user_id, fingerprint)
            for r in records
        )

    def add_upvote(
        self,
        agent_id: str,
        user_id: Optional[str] = None,
        fingerprint: Optional[str] = None,
    ) -> Optional[UpvoteRecord]:
        records = read_list_file(self.file_path, UpvoteRecord)
        if any(
            r.agent_id == agent_id and self._matches_voter(r, user_id, fingerprint)
            for r in records
        ):
            return None  # already upvoted

        new_record = UpvoteRecord(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            user_id=user_id,
            digital_fingerprint_hash=fingerprint,
            created_at=datetime.now(timezone.utc),
        )
        records.append(new_record)
        write_list_file(self.file_path, records)
        return new_record

    def remove_upvote(
        self,
        agent_id: str,
        user_id: Optional[str] = None,
        fingerprint: Optional[str] = None,
    ) -> bool:
        records = read_list_file(self.file_path, UpvoteRecord)
        initial_len = len(records)
        records = [
            r
            for r in records
            if not (
                r.agent_id == agent_id
                and self._matches_voter(r, user_id, fingerprint)
            )
        ]
        if len(records) < initial_len:
            write_list_file(self.file_path, records)
            return True
        return False

    def get_recent_upvotes_count(self, agent_id: str, hours: int = 168) -> int:
        records = read_list_file(self.file_path, UpvoteRecord)
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        return sum(
            1
            for r in records
            if r.agent_id == agent_id and _to_utc(r.created_at) >= cutoff
        )

