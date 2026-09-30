# Full-Stack Cross-Verification Guidelines

These rules establish verification protocols ensuring that changes made to the backend or frontend maintain strict parity, type integrity, and end-to-end functionality.

---

## 1. Type Parity Between Backend & Frontend

Whenever domain models are added or modified, corresponding definitions across both stacks must remain synchronized:

| Backend Pydantic Model (`backend/app/models/`) | Frontend TypeScript Type (`frontend/src/types/`) | Validation Responsibility |
|---|---|---|
| `AgentResponse`, `AgentInDb` | `Agent` in `agent.ts` | Field names, types, optionality, enum values |
| `CategoryResponse` | `Category` in `agent.ts` | Slugs, icon identifiers, agent counts |
| `CollectionResponse` | `Collection` in `agent.ts` | Curation metadata, agent ID lists |
| `SubmissionCreate` | `SubmissionFormState` in `agent.ts` | Form field validations, URL constraints |
| `ReviewCreate`, `ReviewResponse` | `Review` in `agent.ts` | Star ratings (1-5), author, comment body |

---

## 2. API Endpoint & Hook Alignment

Every REST endpoint registered in `backend/app/routers/` must have a corresponding RTK Query hook in `frontend/src/store/api/agentsApi.ts`:

- `GET /api/agents` $\rightarrow$ `useGetAgentsQuery`
- `GET /api/agents/{id}` $\rightarrow$ `useGetAgentByIdQuery`
- `POST /api/agents/{id}/upvote` $\rightarrow$ `useUpvoteAgentMutation`
- `GET /api/categories` $\rightarrow$ `useGetCategoriesQuery`
- `GET /api/collections` $\rightarrow$ `useGetCollectionsQuery`
- `POST /api/submissions` $\rightarrow$ `useSubmitAgentMutation`
- `GET /api/reviews` $\rightarrow$ `useGetReviewsQuery`
- `POST /api/reviews` $\rightarrow$ `useCreateReviewMutation`

---

## 3. Seed Data Integrity Protocol

1. Flat JSON files in `backend/data/*.json` are the primary source of truth for the local database.
2. The mock catalog in `frontend/src/data/mockAgents.ts` acts as fallback/static reference data and must reflect identical fields, tags, and engineering telemetry attributes.

---

## 4. End-to-End Verification Requirement

Before marking any full-stack task as complete, execute the repository-wide verification script:

```bash
uv run python .agents/skills/fullstack-verification/scripts/verify-all.py
```

This automated suite ensures that:
1. All JSON files in `backend/data/` are valid, well-formed JSON arrays.
2. The complete backend test suite passes with 0 failures (`backend/test_api.py`).
3. The frontend passes strict TypeScript type-checking (`tsc -b`) and Vite production bundling (`vite build`).
