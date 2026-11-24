---
trigger: glob
globs: "backend/**"
description: FastAPI 4-tier layered architecture, Pydantic v2 validation, and DI rules for backend files.
---
<!-- [DEMO-02] Path-Scoped Backend Rules (loaded only when working in backend/**) -->
# Backend Architecture & Engineering Rules

1. **Strict 4-Tier Layering (`routers` → `services` → `repositories` → `data/*.json`)**:
   - Routers (`backend/app/routers/`) parse HTTP inputs and inject services via `Depends(get_*_service)` from `backend/app/dependencies.py`. Never import repositories or read JSON files inside a router.
   - Services (`backend/app/services/`) own business rules, exponential time-decay scoring, XSS sanitization, and deduplication.
   - Repositories (`backend/app/repositories/`) own JSON array I/O through `backend/app/utils/json_store.py`.
2. **Pydantic v2 Schema Boundaries (`backend/app/models/`)**:
   - Separate `*Request`, `*InDb`, and `*Response` models; never accept untyped `dict` bodies.
   - Trim text inputs, validate `http(s)://` URLs and emails via `@field_validator`, and use timezone-aware UTC datetimes (`datetime.now(timezone.utc)`).
3. **Quality Gate**:
   - Run `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy`, and `uv run python test_api.py` from `backend/`.
