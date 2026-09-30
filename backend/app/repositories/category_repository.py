from pathlib import Path
from typing import Optional
from app.models.category import CategoryInDb
from app.utils.json_store import read_list_file, write_list_file


class CategoryRepository:
    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path

    def get_all(self) -> list[CategoryInDb]:
        return sorted(
            read_list_file(self.file_path, CategoryInDb),
            key=lambda c: c.display_order,
        )

    def get_by_id(self, category_id: str) -> Optional[CategoryInDb]:
        for cat in self.get_all():
            if cat.id == category_id:
                return cat
        return None

    def get_by_slug(self, slug: str) -> Optional[CategoryInDb]:
        for cat in self.get_all():
            if cat.slug == slug:
                return cat
        return None

    def save_all(self, categories: list[CategoryInDb]) -> None:
        write_list_file(self.file_path, categories)

