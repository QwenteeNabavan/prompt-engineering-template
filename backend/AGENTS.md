# Backend Agent Guide — AgentHub

This directory contains the **FastAPI** backend for AgentHub, providing RESTful APIs for autonomous agent discovery, telemetry benchmarking, community reviews, and submission management.

## 1. Technical Stack & Tooling

- **Framework**: FastAPI with asynchronous route handlers and dependency injection.
- **Python Version**: `>= 3.11`
- **Package Manager**: `uv`
- **Validation**: Pydantic v2 schemas (`*Request`, `*InDb`, `*Response`)
- **Persistence**: Flat-file JSON array stores in `backend/data/*.json`
- **Linter**: Ruff (`uv run ruff check .`)
- **Formatter**: Ruff Format (`uv run ruff format .`)
- **Type Checker**: Mypy (`uv run mypy app`)
- **Test Suite**: `uv run python test_api.py`

## 2. Layered Architecture

```
app/
├── routers/        --> HTTP endpoints, URL parsing, status codes, OpenAPI docs
├── services/       --> Business logic, time-decay ranking, validation rules
├── repositories/   --> File I/O operations, disk read/writes on JSON arrays
├── models/         --> Pydantic v2 schemas (strict boundaries)
├── types/          --> Domain Enums and Type Aliases
├── utils/          --> json_store.py (read/write JSON arrays) and paths.py
└── dependencies.py --> Dependency injection factories (get_*_service, get_*_repo)
```

## 3. Strict Rules & Invariants

1. **Layer Boundary**: Routers NEVER talk directly to repositories or data files. Always use `Depends(get_<entity>_service)`.
2. **JSON Array Invariant**: Every file in `backend/data/*.json` MUST be a root-level JSON array (`[...]`).
3. **UTC Timestamps**: Persist all timestamps in ISO 8601 UTC format. `created_at` fields are immutable once generated.
4. **Time-Decay Ranking**: Calculated as $\text{Score} = \frac{\text{Upvotes}_{7\text{d}} + 1}{(\text{Age}_{\text{hours}} + 2)^{1.5}}$.

