# Project agents guide

This repository is a full-stack boilerplate: **FastAPI** backend and **React (TypeScript)** frontend.

## Layout

- `backend/` — API with layered architecture (`types`, `models`, `repositories`, `services`, `routers`, `utils`). Data is stored in JSON files under `backend/data/` (one file per entity, contents are a JSON array). Uses **uv**, **Pydantic**, and FastAPI dependency injection (routers depend on services; services use repositories).
- `frontend/` — **React + TypeScript**, **shadcn/ui**, **Redux Toolkit** (RTK Query for API, slices for UI state). No authentication.
- `docs/` — Feature documentation organized with one folder per feature for the entire app (`docs/<feature>/`), containing business requirements, architecture, and test cases.

## Current scope

**AgentHub**: Autonomous AI agent directory and technical benchmarking platform. Features:
- **Agents**: Directory with debounced fuzzy search, multi-faceted filtering, detailed technical audit profiles, and time-decay ranking.
- **Submissions**: Contributor intake portal with schema validation, bot mitigation, and 12h review SLA.
- **Comparisons**: Curated roundups and side-by-side comparative matrix across 5 standardized engineering parameters.

## Working conventions

- Add new features under the same layer folders on the backend and under `src/features/` on the frontend.
- Document each feature under `docs/<feature>/` (consolidated full-stack documentation).
- Keep AI assistant entry points minimal: this file is the source of truth; `Claude.md` points here.

## Local development

1. Backend: from `backend/`, run `uv sync` then `uv run dev` (see `[tool.uv.scripts]` in `pyproject.toml`).
2. Frontend: from `frontend/`, run `npm install` then `npm run dev` (dev server port **5174**; default API base: `http://localhost:8001/api`).

VS Code: `.vscode/launch.json` starts the backend; `.vscode/tasks.json` installs dependencies and runs the frontend dev server.
