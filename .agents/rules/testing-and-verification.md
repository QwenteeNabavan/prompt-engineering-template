# Testing and Verification Guidelines

All changes made to AgentHub must adhere to strict verification criteria prior to declaring tasks complete.

## Verification Requirements

1. **Backend Integration Tests**:
   - Run `uv run python test_api.py` from the `backend/` directory whenever backend endpoints, services, repositories, or data schemas are modified.
   - All tests across categories, directory filtering, agent profiles, upvotes deduplication, comparison matrices, and community submissions must pass with code 0.

2. **Frontend Type Checking & Bundle Compilation**:
   - Run `npm run build` from the `frontend/` directory whenever modifying TypeScript types, components, or stores.
   - The build must complete with zero TypeScript compilation errors (`tsc -b`) and valid production chunks (`vite build`).

3. **Data Parity & Schema Consistency**:
   - When introducing or altering fields in backend models (`app/models/`), ensure corresponding updates are made in frontend interfaces (`frontend/src/types/agent.ts`).
   - Seed data in `backend/data/*.json` must conform strictly to the defined Pydantic models.
