# AgentHub Lifecycle Hooks & Git Guards

This folder (`.agents/hooks/`) contains deterministic guardrails for both AI coding agents and Git commits.

## 1. Antigravity Lifecycle Hooks ([`.agents/hooks.json`](../hooks.json))

- **`backend-guard.py`**:
  - `PostToolUse` (`write_file|edit_file|...`, reading `args.Path`): Auto-formats modified backend `.py` files with `uv run ruff format` and fixes lint issues with `uv run ruff check --fix`.
  - `Stop`: Compiles Python modules (`py_compile`), runs **Ruff linter**, **Ruff formatter check**, **Mypy type checker**, and **backend integration tests** (`test_api.py`). Returns `{"decision": "continue", "reason": ...}` on failure so the agent self-corrects automatically.
- **`frontend-guard.py`**:
  - `PostToolUse` (`write_file|edit_file|...`, reading `args.Path`): Auto-formats modified `frontend/src/**/*.{ts,tsx,css,json}` files using **Prettier**.
  - `Stop`: Runs **Oxlint** (`npm run lint`), **Prettier check** (`npm run format:check`), and **TypeScript compiler** (`npm run type-check`).
- **`guard-integrity.py`**:
  - Verifies that all 5 persistence files in `backend/data/*.json` remain valid root-level JSON arrays (`[...]`).

## 2. Git Pre-Commit Hooks

Installed at `.git/hooks/pre-commit` (Unix/Git Bash copy in `pre-commit`, Windows batch script in `pre-commit.bat`). Blocks any commit if Ruff, Mypy, Oxlint, Prettier, TypeScript, JSON store integrity, or `test_api.py` fails.
