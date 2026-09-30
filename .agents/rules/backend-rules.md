# Backend Architecture & Engineering Rules

These rules govern all backend development for AgentHub (`backend/`), ensuring strict architectural compliance, type safety, and data persistence guarantees.

---

## 1. Architectural Layering & Separation of Concerns

The backend follows a strict 4-tier layered architecture. Direct dependencies between non-adjacent layers are prohibited:

```
[HTTP Request]
      │
      ▼
┌──────────────┐
│   Routers    │  --> FastAPI route handlers, query parsing, status codes, OpenAPI metadata
└──────┬───────┘
       │  (FastAPI Depends)
       ▼
┌──────────────┐
│   Services   │  --> Domain business logic, ranking formulas, deduplication, validations
└──────┬───────┘
       │  (Direct instantiation / dependency injection)
       ▼
┌──────────────┐
│ Repositories │  --> JSON flat-file I/O operations, disk read/write, file locking
└──────┬───────┘
       │  (File system access)
       ▼
┌──────────────┐
│  Data Store  │  --> backend/data/*.json (Arrays of JSON objects)
└──────────────┘
```

### Prohibited Cross-Layer Violations:
- **Never access repositories or data files directly from routers.** Routers must only communicate through services.
- **Never embed HTTP logic or status codes in repositories or services.** Services should raise domain exceptions (e.g. `AgentNotFoundError`, `DuplicateUpvoteError`), which routers or exception handlers convert into HTTP response codes.
- **Never store database connections or state in global module variables.**

---

## 2. Dependency Injection & Service Lifecycle

- All routers must resolve their service instances through FastAPI's dependency injection (`Depends`):
  ```python
  @router.get("/agents/{agent_id}", response_model=AgentResponse)
  async def get_agent(
      agent_id: str,
      service: AgentService = Depends(get_agent_service)
  ) -> AgentResponse:
      return await service.get_agent_by_id(agent_id)
  ```
- Dependency factory functions reside in [`backend/app/dependencies.py`](file:///c:/Users/qwentee/Documents/GitHub/prompt-engineering-template/backend/app/dependencies.py).

---

## 3. Pydantic v2 Models & Schema Boundaries

All incoming payloads, internal database records, and outgoing responses must use dedicated Pydantic schemas under `backend/app/models/`:

1. **Request Schemas (`*Request` / `*Create` / `*Update`)**:
   - Enforce string trimming (`str.strip()`), minimum and maximum lengths.
   - Enforce URL format validation with `HttpUrl` or regex checks.
   - Validate optional fields with sensible defaults or `None`.
2. **Database Schemas (`*InDb`)**:
   - Represent the full record as persisted in `backend/data/*.json`.
   - Must contain audit fields: `id: str` (UUIDv4), `created_at: datetime`, `updated_at: datetime`.
3. **Response Schemas (`*Response`)**:
   - Define exact contracts returned to clients.
   - Strip sensitive or internal administration attributes before returning.

---

## 4. Flat-File JSON Storage Rules

1. **Array Shape Guarantee**:
   - Every file in `backend/data/*.json` MUST be a root-level JSON array (`[...]`).
   - Objects within the array must match their corresponding `*InDb` schema.
2. **Audit Timestamp Standard**:
   - Timestamps must always use UTC: `datetime.now(timezone.utc).isoformat()`.
   - Creation timestamps (`created_at`) are immutable once written.
3. **Atomic File Writes**:
   - Repositories must write to storage files atomically using temporary files or safe flush operations to prevent corrupted or half-written JSON data.

---

## 5. Ranking & Math Algorithms

- The exponential time-decay score calculation is deterministic:
  $$\text{Score} = \frac{\text{Upvotes}_{7\text{d}} + 1}{(\text{Age}_{\text{hours}} + 2)^{1.5}}$$
- Any modifications to the scoring constants must be accompanied by unit tests verifying monotonic rank decay over time.

---

## 6. Testing & Quality Assurance

- Every new endpoint, service method, and repository query must have test coverage in [`backend/test_api.py`](file:///c:/Users/qwentee/Documents/GitHub/prompt-engineering-template/backend/test_api.py).
- Tests must be executed using:
  ```bash
  cd backend && uv run python test_api.py
  ```
- All tests must pass with zero failures before committing code.
