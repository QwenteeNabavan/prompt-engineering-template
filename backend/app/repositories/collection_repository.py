from pathlib import Path
from typing import Optional
from app.models.collection import CollectionInDb
from app.utils.json_store import read_list_file, write_list_file


class CollectionRepository:
    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path

    def get_all(self) -> list[CollectionInDb]:
        cols = read_list_file(self.file_path, CollectionInDb)
        return sorted(
            [c for c in cols if c.is_published],
            key=lambda c: c.display_order,
        )

    def get_by_slug(self, slug: str) -> Optional[CollectionInDb]:
        for col in self.get_all():
            if col.slug == slug:
                return col
        return None

    def create(self, collection: CollectionInDb) -> CollectionInDb:
        cols = read_list_file(self.file_path, CollectionInDb)
        cols.append(collection)
        write_list_file(self.file_path, cols)
        return collection

