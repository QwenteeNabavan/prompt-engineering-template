# Curated Collections & Comparisons — Architecture

## Overview

The Collections & Comparisons feature drives structured discovery and deep comparative analysis. It provides editorial curation backed by relational models, and an interactive client-side staging dock coupled with an engineering telemetry matrix.

```mermaid
flowchart LR
  User([User / Browser])
  StagingDock[Comparison Staging Dock / 2-3 Agents]
  MatrixView[Comparative Matrix Component]
  API[API Layer /collections & /agents/compare]
  DB[(PostgreSQL / Supabase)]

  User -->|Selects 2-3 Agents| StagingDock
  StagingDock -->|Synchronizes ?agents=slug1,slug2| MatrixView
  MatrixView -->|Query Telemetry| API
  API -->|Fetch Agents & Benchmark Metrics| DB
  DB -->>API: Structured Engineering Telemetry
  API -->>MatrixView: Comparative DTO Payload
  MatrixView -->>User: Renders Side-by-Side Matrix
```

---

## Data Schema & Storage

### 1. `collections` Table

Stores editorial industry roundups and curated groupings.

```sql
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    editorial_summary TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    featured_agent_ids UUID[] NOT NULL DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_slug ON collections(slug);
```

### 2. Engineering Benchmark Telemetry Attributes (in `agents` or extension)

To power the 5 comparison dimensions, agent records include validated technical telemetry:

| Parameter | Type | Schema Attribute | Notes |
|-----------|------|------------------|-------|
| **Autonomy Level** | `VARCHAR(30)` | `autonomy_level` | `fully_autonomous`, `semi_autonomous_approval`, `copilot_suggestive` |
| **Vector Memory / RAG** | `BOOLEAN` + `TEXT` | `has_vector_rag`, `memory_backend` | Native chroma/pgvector/milvus or ephemeral context |
| **Multimodal Handling** | `TEXT[]` | `multimodal_capabilities` | e.g. `['screenshots', 'dom_inspection', 'file_uploads', 'audio']` |
| **Token Overhead Tier** | `VARCHAR(20)` | `token_overhead_tier` | `low` (<2k tokens/step), `moderate` (2k-10k), `heavy` (>10k tokens/step) |
| **Maintenance Cadence** | `VARCHAR(30)` | `maintenance_cadence` | Computed from GitHub API: `weekly_releases`, `monthly_releases`, `infrequent` |

---

## Client-Side Staging Architecture

### URL State & Staging Redux Slice

- **URL-First Synchronization**: The active comparison matrix is driven primarily by URL query params: `/compare?agents=slug-a,slug-b,slug-c`. This ensures comparisons can be directly bookmarked, emailed, or shared in technical evaluations.
- **Client Dock (`compareSlice`)**:
  - Maintains array `stagedAgentSlugs: string[]` (max length 3).
  - Floating bottom drawer displays currently staged agents with remove buttons and a "Compare Now" trigger.
  - Rejects addition of a 4th agent with an instructional toast: "Maximum 3 agents can be compared simultaneously."

---

## API Surface

| Method | Endpoint | Query Parameters | Description |
|--------|----------|------------------|-------------|
| `GET` | `/api/collections` | `limit`, `offset` | List published curated collections |
| `GET` | `/api/collections/{slug}` | None | Detailed collection view with member agent previews |
| `GET` | `/api/agents/compare` | `slugs=slug1,slug2,slug3` | Fetches normalized side-by-side benchmark telemetry for 2 or 3 agents |

