# AgentHub Lifecycle Hooks & Git Guards

This folder (`.agents/hooks/`) contains automated guardrails and verification hooks for AgentHub.

## 1. Antigravity Agent Lifecycle Hooks (`.agents/hooks.json`)

These hooks are triggered automatically by AI coding assistants during execution:
- **`backend-guard.py`**:
  - On `PostToolUse` (`write_to_file|replace_file_content`): Auto-formats modified Python files using `uv run ruff format` and auto-fixes lint issues via `uv run ruff check --fix`.
  - On `Stop`: Validates Python syntax (`py_compile`), runs **Ruff linter** (`uv run ruff check .`), **Ruff formatter check** (`uv run ruff format --check .`), **Mypy type checker** (`uv run mypy`), and the **backend integration test suite** (`test_api.py`).
- **`frontend-guard.py`**:
  - On `PostToolUse` (`write_to_file|replace_file_content`): Auto-formats modified frontend files (`.ts`, `.tsx`, `.css`, `.json`) using **Prettier**.
  - On `Stop`: Runs **Oxlint linter** (`npm run lint`), **Prettier format check** (`npm run format:check`), and **TypeScript type checker** (`npm run type-check`).
- **`guard-integrity.py`**:
  - Validates that all database files in `backend/data/*.json` remain root-level JSON arrays `[...]`.

## 2. Git Pre-Commit Hooks

Prevents committing broken code, lint warnings, bad formatting, or type errors:
- **`pre-commit`** (Bash / Unix / Git Bash — installed in `.git/hooks/pre-commit`)
- **`pre-commit.bat`** (Windows CMD / PowerShell)

### Manual Execution or Re-installation:
```bash
# On Linux / macOS / Git Bash:
cp .agents/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Run manually on Windows:
.\.agents\hooks\pre-commit.bat
```

## 3. Linter, Formatter & Type-Checker Commands

| Stack | Tool | Check Command | Auto-Fix / Format Command |
|-------|------|---------------|---------------------------|
| **Backend Linter** | Ruff | `cd backend && uv run ruff check .` | `cd backend && uv run ruff check --fix .` |
| **Backend Formatter** | Ruff Format | `cd backend && uv run ruff format --check .` | `cd backend && uv run ruff format .` |
| **Backend Type Checker** | Mypy | `cd backend && uv run mypy` | — |
| **Frontend Linter** | Oxlint | `cd frontend && npm run lint` | `cd frontend && npm run lint:fix` |
| **Frontend Formatter** | Prettier | `cd frontend && npm run format:check` | `cd frontend && npm run format` |
| **Frontend Type Checker** | TypeScript (`tsc`) | `cd frontend && npm run type-check` | — |
| **Frontend All-in-One** | Oxlint + Prettier + `tsc` | `cd frontend && npm run check` | `cd frontend && npm run format && npm run lint:fix` |
| **Full-Stack Verification** | All + Integration Tests | `python .agents/skills/fullstack-verification/scripts/verify-all.py` | — |
