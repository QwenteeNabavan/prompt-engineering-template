# Claude Code Project Guide — AgentHub

This document outlines the architecture, tooling, conventions, and agent system for **AgentHub** — an autonomous AI agent directory and technical benchmarking platform.

---

## 1. Project Overview & Architecture

AgentHub is a production-grade full-stack web application designed to discover, audit, benchmark, and compare autonomous AI agents:
- **Backend**: **FastAPI** (Python 3.11+), managed with **uv**, **Pydantic v2**, and dependency injection.
  - Layered architecture: `app/routers/` → `app/services/` → `app/repositories/` → `backend/data/*.json`.
  - Persistence: Flat-file JSON arrays in `backend/data/` (`agents.json`, `categories.json`, `collections.json`, `upvotes.json`, `reviews.json`).
- **Frontend**: **React 19**, **TypeScript**, **Redux Toolkit** (RTK Query for API fetching, slices for UI state), **Tailwind CSS v4**, and **shadcn/ui** components.
- **Documentation**: Feature specifications in `docs/<feature>/` (BRD, architecture, and test cases).

---

## 2. Development Commands & Tooling

### Dev Servers
| Service | Directory | Command | URL / Port |
|---------|-----------|---------|------------|
| Backend API | `backend/` | `uv run uvicorn app.main:app --reload --port 8001` | `http://127.0.0.1:8001` (Docs: `/docs`) |
| Frontend UI | `frontend/` | `npm run dev` | `http://127.0.0.1:5174` |

### Code Quality: Linters, Formatters & Type Checkers

| Role | Tool | Backend Command (`backend/`) | Frontend Command (`frontend/`) |
|------|------|------------------------------|--------------------------------|
| **Linter** | Ruff / Oxlint | `uv run ruff check .` (fix: `--fix`) | `npm run lint` |
| **Type Checker** | Mypy / TSC | `uv run mypy app` | `npm run type-check` (`tsc -b --noEmit`) |
| **Formatter** | Ruff / Prettier | `uv run ruff format .` (check: `--check`) | `npm run format` (check: `npm run format:check`) |
| **Test Suite** | Python / Jest | `uv run python test_api.py` | `npm run build` |

---

## 3. Agent Rules, Skills & Hooks Architecture

The repository configures autonomous AI agents via the `.agents/` directory:

```
.agents/
├── rules/                       # Declarative architectural constraints
│   ├── backend-rules.md         # FastAPI layered architecture, Pydantic v2, UTC dates
│   ├── frontend-rules.md        # React 19, RTK Query caching, UI accessibility
│   ├── cross-verification.md    # Schema parity between backend and frontend
│   ├── code-style.md            # Formatting, import sorting, naming standards
│   ├── safety-and-persistence.md# JSON array integrity, immutable audit columns
│   └── testing-and-verification.md # Mandatory test passes before commit
├── skills/                      # Reusable agent capabilities & workflows
│   ├── agenthub-agent-audit/    # 5-parameter benchmarking & MCP compliance audit
│   ├── backend-development/     # FastAPI service & repository development
│   ├── frontend-development/    # React component & Redux slice creation
│   └── fullstack-verification/  # Full cross-system health check (`verify-all.py`)
├── hooks/                       # Lifecycle guards & pre-commit safety
│   ├── backend-guard.py         # Syntax check + integration test verification
│   ├── frontend-guard.py        # TypeScript build compilation guard
│   ├── guard-integrity.py       # JSON array structure validation
│   ├── pre-commit               # Git hook for Unix/macOS
│   └── pre-commit.bat           # Git hook for Windows
└── hooks.json                   # Antigravity assistant lifecycle hook bindings
```

---

## 4. Model Context Protocol (MCP) Integration

AgentHub actively catalogs and benchmarks agents based on **Model Context Protocol (MCP)** compliance:
- **What is MCP**: An open standard developed by Anthropic allowing AI models to securely connect with tools, data sources, and runtime environments over JSON-RPC.
- **Core Primitives**:
  1. **Tools**: Callable functions with input schemas (e.g., execute bash command, query database).
  2. **Resources**: URI-addressable contextual data (e.g., file contents, system logs).
  3. **Prompts**: Standardized interactive prompt templates and workflows.
- **In AgentHub**: Every audited agent profile records `is_mcp_compliant: bool` and documents supported MCP servers and client configurations.

---

## 5. Critical Invariants & Rules for AI Assistants

1. **Storage Array Invariant**: Files in `backend/data/*.json` must **always** be valid JSON arrays (`[...]`), never root objects.
2. **Deterministic Time-Decay Scoring**:
   $$\text{Score} = \frac{\text{Upvotes}_{7\text{d}} + 1}{(\text{Age}_{\text{hours}} + 2)^{1.5}}$$
3. **Test Data Cleanup**: Running `test_api.py` modifies `backend/data/agents.json` and `reviews.json` with temporary verification records. **Always restore them** before committing:
   ```bash
   git checkout -- backend/data/
   ```
4. **Zero Error Policy**: Both `uv run ruff check .` and `npm run type-check` must pass with 0 errors.

