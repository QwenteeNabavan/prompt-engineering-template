<!-- [DEMO-01] Single Source of Truth for AI Coding Agents (Agents.MD) -->
# AgentHub — Project Agents Guide

This repository is the **AgentHub** autonomous AI agent directory and technical benchmarking platform (**FastAPI** backend + **React 19 / TypeScript** frontend). This file is the **Single Source of Truth**; [`Claude.md`](./Claude.md) points here.

## 1. Architecture & Layout

- `backend/` — Layered FastAPI API (`routers` → `services` → `repositories` → `data/*.json`), managed with **uv** and **Pydantic v2** dependency injection. Persistence uses root-level JSON arrays in `backend/data/`.
- `frontend/` — **React 19 + TypeScript (Vite)**, **Tailwind CSS v4**, **shadcn/ui**, **Redux Toolkit** (RTK Query for server state, slices for UI state), and **Fuse.js** (250ms debounced fuzzy search).
- `docs/` — Consolidated full-stack feature documentation (`docs/<feature>/`: `business-requirements.md`, `architecture.md`, `test-cases.md`), one folder per feature (`agents`, `submissions`, `comparisons`).
- `.agents/` — Agent harness customizations:
  - `rules/` — Path-scoped constraints (`backend-rules.md`, `frontend-rules.md`, `cross-verification.md`, `code-style.md`, `safety-and-persistence.md`, `testing-and-verification.md`).
  - `skills/` — On-demand procedural workflows (`agenthub-agent-audit`, `backend-development`, `frontend-development`, `fullstack-verification`, `jira-management`).
  - `hooks/` & `hooks.json` — Deterministic `PostToolUse`, `Stop`, and Git `pre-commit` guards.
  - `mcp_config.json` — Remote Atlassian Jira MCP v2 (`https://mcp.atlassian.com/v2/mcp`) via OAuth 2.0.

## 2. Core Features

- **Agents (`docs/agents/`)**: Searchable catalog across 5 categories, runtime/pricing/MCP filters, detailed technical audit profiles, deduplicated fingerprint upvotes, and exponential time-decay ranking:
  $$\text{Score} = \frac{\text{Upvotes}_{7\text{d}} + 1}{(\text{Age}_{\text{hours}} + 2)^{1.5}}$$
- **Submissions (`docs/submissions/`)**: Maintainer intake portal with Pydantic v2 schema validation, XSS sanitization, bot mitigation, and a 12-hour review SLA (`pending` queue).
- **Comparisons (`docs/comparisons/`)**: Curated industry roundups and side-by-side matrix across 5 standardized engineering parameters, exportable as Markdown ADR tables.

## 3. Development & Quality Commands

| Layer | Dev Server | Linter | Formatter | Type Checker | Tests / Build |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend** (`backend/`) | `uv run uvicorn app.main:app --reload --port 8001` | `uv run ruff check .` | `uv run ruff format --check .` | `uv run mypy` | `uv run python test_api.py` |
| **Frontend** (`frontend/`) | `npm run dev` (port `5174`) | `npm run lint` (`oxlint`) | `npm run format:check` (`prettier`) | `npm run type-check` (`tsc -b`) | `npm run build` |

Full-stack one-shot verification: `python .agents/skills/fullstack-verification/scripts/verify-all.py`.

## 4. Non-Negotiable Invariants

1. **JSON Array Store**: Every `backend/data/*.json` file must remain a valid root-level JSON array (`[...]`).
2. **Layer Isolation**: FastAPI routers depend strictly on services (`Depends(get_*_service)`), never repositories or raw files.
3. **Zero-Error Gate**: All linters, formatters, type checkers, and integration tests must exit with `0` errors before completion or commit.
