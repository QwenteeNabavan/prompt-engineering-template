---
name: backend-development
description: >-
  Use this skill when developing, testing, or extending FastAPI endpoints, Pydantic schemas,
  services, repositories, and JSON store operations in AgentHub backend.
---

# AgentHub Backend Development Skill

This skill guides engineering workflows for the AgentHub backend, adhering to clean architecture, Pydantic v2 schemas, and dependency injection principles.

## Architecture Overview

```
backend/
├── app/
│   ├── main.py              # Application entry point & FastAPI setup
│   ├── dependencies.py      # Dependency injection factories (get_agent_service, etc.)
│   ├── models/              # Pydantic v2 schemas (AgentInDb, AgentResponse, etc.)
│   ├── repositories/        # JSON file storage layer (read/write flat JSON arrays)
│   ├── routers/             # REST HTTP route handlers (/api/agents, /api/reviews)
│   ├── services/            # Domain logic, time-decay scoring, deduplication
│   ├── types/               # Type aliases and enum definitions
│   └── utils/               # JSON store helpers and path resolvers
├── data/                    # JSON flat-file storage (*.json)
├── pyproject.toml           # uv project configuration and dependencies
└── test_api.py              # Integration test suite
```

## Standard Development Workflow

When adding a new entity or endpoint to AgentHub:

1. **Define Types & Enums**: Add domain primitives to `backend/app/types/`.
2. **Define Schemas**: Create request (`*Create`, `*Update`), database (`*InDb`), and response (`*Response`) schemas in `backend/app/models/`.
3. **Implement Repository**: Write file I/O operations in `backend/app/repositories/` extending the JSON store utilities.
4. **Implement Service**: Encapsulate business logic, validations, and domain calculations in `backend/app/services/`.
5. **Register Dependency**: Expose dependency provider functions in `backend/app/dependencies.py`.
6. **Create Router**: Implement HTTP endpoint handlers in `backend/app/routers/` injecting the service.
7. **Mount Router**: Mount the new router in `backend/app/main.py`.
8. **Add Tests**: Write integration tests in `backend/test_api.py`.

## Running Verification

Execute the backend cross-check script:
```bash
python .agents/skills/backend-development/scripts/verify-backend-cross.py
```
Or run the backend test suite directly:
```bash
cd backend && uv run python test_api.py
```
