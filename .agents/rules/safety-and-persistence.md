---
trigger: glob
globs:
  - "backend/data/**"
  - "backend/app/repositories/**"
  - "backend/app/services/**"
description: JSON array storage invariants, immutable audit fields, deduplication, and time-decay formula rules.
---
# Safety & Data Persistence Guidelines

1. **JSON Array Invariant**: Every file in `backend/data/*.json` (`agents.json`, `categories.json`, `collections.json`, `upvotes.json`, `reviews.json`) must always be a valid root-level JSON array (`[...]`), never a root object.
2. **Immutable Audit Columns**: `id` (UUID) and `created_at` (UTC ISO-8601) are immutable once created; mutations refresh `updated_at`.
3. **Deduplication**: Upvotes in `upvotes.json` are deduplicated per `(agent_id, user_id | digital_fingerprint_hash)`; agent and category `slug` values must remain unique.
4. **Deterministic Time-Decay Ranking**:
   $$\text{Score} = \frac{\text{Upvotes}_{7\text{d}} + 1}{(\text{Age}_{\text{hours}} + 2)^{1.5}}$$
   Do not alter constants (`168h` window, `+1` Laplace offset, `+2` hour buffer, `1.5` gravity exponent) without updating `docs/agents/architecture.md` and `backend/test_api.py`.
