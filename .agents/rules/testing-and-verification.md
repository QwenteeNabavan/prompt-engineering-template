---
trigger: always_on
description: Mandatory verification gates before claiming completion or committing changes.
---
# Testing & Verification Gate

Never declare a task complete or create a commit without fresh command output confirming:
1. **JSON Store Integrity**: `python .agents/hooks/guard-integrity.py` passes across all 5 `backend/data/*.json` files.
2. **Backend Suite**: `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy`, and `uv run python test_api.py` (in `backend/`) pass with exit code `0`. Note: `test_api.py` snapshots and restores `backend/data/*.json` automatically.
3. **Frontend Suite**: `npm run check` and `npm run build` (in `frontend/`) complete with `0` warnings and `0` errors.
