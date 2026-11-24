---
trigger: model_decision
description: Apply when adding or modifying API endpoints, Pydantic models, TypeScript interfaces, or RTK Query hooks across backend and frontend.
---
# Full-Stack Cross-Verification Guidelines

## 1. Type Parity Between Backend & Frontend

| Backend Pydantic Schema (`backend/app/models/`) | Frontend Type (`frontend/src/types/agent.ts`) |
| :--- | :--- |
| `AgentListItemResponse`, `AgentDetailResponse` | `AgentListItem`, `AgentDetail` |
| `CategoryResponse` | `Category` |
| `CollectionResponse`, `ComparisonMatrixResponse` | `Collection`, `ComparisonMatrixResponse` |
| `SubmissionCreateRequest`, `SubmissionResponse` | `SubmissionPayload`, `SubmissionResponse` |
| `UpvoteRequest`, `UpvoteResponse` | `UpvoteResponse` |
| `ReviewCreateRequest`, `ReviewResponse` | `ReviewCreateInput`, `Review` |

## 2. REST Endpoint ↔ RTK Query Hook Alignment (`agentsApi.ts`)

- `GET /api/categories` → `useListCategoriesQuery`
- `GET /api/agents` → `useListAgentsQuery`
- `GET /api/agents/{slug}` → `useGetAgentQuery`
- `GET /api/agents/{slug}/alternatives` → `useGetAlternativesQuery`
- `POST /api/agents/{agent_id}/upvote` → `useToggleUpvoteMutation`
- `POST /api/submissions` → `useSubmitAgentMutation`
- `GET /api/collections` → `useListCollectionsQuery`
- `GET /api/collections/{slug}` → `useGetCollectionQuery`
- `GET /api/collections/compare/matrix` → `useCompareAgentsQuery`
- `GET /api/agents/{slug}/reviews` → `useListReviewsQuery`
- `POST /api/agents/{agent_id}/reviews` → `useCreateReviewMutation`

## 3. End-to-End Verification

Run `python .agents/skills/fullstack-verification/scripts/verify-all.py` after any cross-stack schema change.
