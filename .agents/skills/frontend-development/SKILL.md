---
name: frontend-development
description: >-
  Use this skill when developing, testing, or modifying React components, Redux slices,
  RTK Query hooks, Tailwind CSS layouts, and arcade mini-games in AgentHub frontend.
---

# AgentHub Frontend Development Skill

This skill guides engineering workflows for the AgentHub frontend, adhering to React 19, TypeScript, shadcn/ui, and Redux Toolkit standards.

## Architecture Overview

```
frontend/
├── src/
│   ├── components/
│   │   ├── agenthub/        # AgentHub cards, dialogs, telemetry meters, game modals
│   │   ├── compare/         # Staging dock and comparison views
│   │   ├── layout/          # Top navigation bar and page containers
│   │   └── ui/              # shadcn/ui primitives (Button, Dialog, Badge, Tabs, etc.)
│   ├── data/                # Mock agents and fallback static dataset
│   ├── features/            # Page-level features:
│   │   ├── arcade/          # Mini-games arcade center
│   │   ├── compare/         # Comparative benchmarking matrix
│   │   ├── directory/       # Multi-faceted search and filter directory
│   │   ├── profile/         # In-depth agent audit page
│   │   └── submit/          # 4-stage intake submission portal
│   ├── store/
│   │   ├── api/agentsApi.ts # RTK Query endpoints, caching, mutations
│   │   ├── slices/          # Client-side UI slices (appSlice.ts, compareSlice.ts)
│   │   └── store.ts         # Root Redux store configuration
│   └── types/               # TypeScript interfaces for agents, telemetry, filters
├── public/                  # Static assets (audio, videos, icons)
├── package.json             # NPM dependencies and scripts
└── vite.config.ts           # Vite bundler configuration
```

## Standard Development Workflow

1. **State Management**:
   - For backend data: add query/mutation endpoints to `src/store/api/agentsApi.ts`.
   - For local UI interaction: add action/reducer to `src/store/slices/appSlice.ts`.
2. **Components**:
   - Build accessible components using shadcn/ui primitives under `src/components/ui/`.
   - Style with utility classes in Tailwind CSS. Keep dark cybernetic design language consistent.
3. **Mini-Games & Interactive Features**:
   - Place canvas loops and game mechanics in dedicated components under `src/components/agenthub/`.
   - Ensure clean unmounting of `requestAnimationFrame` and `AudioContext` to prevent memory leaks.
4. **Validation & Verification**:
   - Run type-check and bundle build:
     ```bash
     cd frontend && npm run build
     ```
   - Run cross-check script:
     ```bash
     python .agents/skills/frontend-development/scripts/verify-frontend-cross.py
     ```
