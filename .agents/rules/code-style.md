# Code Style & Architecture Guidelines

These rules govern the development of AgentHub across backend and frontend layers.

## Backend (FastAPI + Pydantic v2)  

1. **Layered Separation of Concerns**:
   - `routers/`: Handle HTTP mapping, query parameter parsing, and status codes. Depend strictly on services via FastAPI dependency injection (`Depends()`). Never access repositories or flat JSON files directly.
   - `services/`: Encapsulate business logic, algorithms (e.g. exponential time-decay ranking), data transformation, and domain exceptions.
   - `repositories/`: Encapsulate JSON flat-file I/O operations (`read_list_file`, `write_list_file`). Never contain HTTP or router logic.
   - `models/`: Define Pydantic v2 schemas for database records (`*InDb`), API responses, and client payloads (`*Request`).
   - `types/`: Define domain type aliases (`AgentId`, `CategoryId`) and enums (`LifecycleState`, `RuntimeEnvironment`).

2. **Validation & Type Safety**:
   - Enforce string trimming and minimum length validation via Pydantic `@field_validator`.
   - Never accept unstructured dictionaries in router request bodies.
   - Guarantee that all datetime attributes are stored and compared using UTC timezone-aware objects (`datetime.now(timezone.utc)`).

---

## Frontend (React 19 + TypeScript + Redux Toolkit + Tailwind CSS)

1. **State Management**:
   - Use RTK Query (`agentsApi.ts`) for all server state, caching, and tag-based cache invalidation.
   - Use Redux slices (`appSlice.ts`, `compareSlice.ts`) strictly for ephemeral client-side UI states (staged comparison items, active modal dialogs).

2. **Component Architecture**:
   - Favor functional components with explicit TypeScript prop typing.
   - Structure features under `frontend/src/features/<feature>/` (e.g., `directory/`, `profile/`, `compare/`, `submit/`).
   - Use shadcn/ui primitives (Radix UI + Tailwind CSS) for accessible UI controls.

3. **Accessibility & Usability**:
   - Support keyboard navigation (`Cmd+K` / `Ctrl+K` for search activation, visible focus rings on interactive elements).
   - Ensure color contrast and dark mode compatibility across all components.
   - Implement debounced inputs (250ms) for high-frequency user actions like search queries.
