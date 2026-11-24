---
name: frontend-development
description: >-
  Use this skill when developing, testing, or modifying React components, Redux slices,
  RTK Query hooks, Fuse.js search, and Tailwind CSS layouts in AgentHub frontend.
---

# AgentHub Frontend Development Skill

Guides engineering workflows for the AgentHub frontend (`React 19`, `TypeScript`, `shadcn/ui`, `Redux Toolkit`, `Tailwind CSS v4`).

## Architecture Overview

```
frontend/src/
├── components/
│   ├── agenthub/        # Cards, FilterBar, HeroTelemetry, QuickView, CommandMenu, SubmitModal
│   ├── compare/         # Floating StagingDock for 2-3 agents
│   ├── layout/          # Navbar and FeaturesMenuDrawer
│   └── ui/              # shadcn/ui primitives (Button, Dialog, Badge, Tabs, Card, Input)
├── data/                # Offline fallback reference dataset (mockAgents.ts)
├── features/            # Route/view containers (directory, profile, compare, submit)
├── store/
│   ├── api/agentsApi.ts # RTK Query endpoints and tag-based cache invalidation
│   ├── slices/          # Ephemeral UI slices (appSlice.ts, compareSlice.ts)
│   └── store.ts         # Root Redux store
└── types/               # TypeScript contracts mirroring backend Pydantic schemas
```

## Standard Workflow

1. **Server State**: Add/consume RTK Query hooks in `src/store/api/agentsApi.ts`; ensure mutations invalidate `'Agent'` or `'Review'` tags.
2. **Client State**: Store UI-only flags and URL-synced filter state in `src/store/slices/appSlice.ts` or `compareSlice.ts`.
3. **Verification**:
   ```bash
   cd frontend && npm run check && npm run build
   python .agents/skills/frontend-development/scripts/verify-frontend-cross.py
   ```
