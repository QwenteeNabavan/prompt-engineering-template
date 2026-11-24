# Frontend Agent Guide — AgentHub

This directory contains the **React 19** frontend for AgentHub, providing an interactive directory with debounced fuzzy search, multi-faceted filtering, detailed technical audit profiles, and side-by-side comparative matrices.

## 1. Technical Stack & Tooling

- **Framework**: React 19 (TypeScript) with Vite
- **State Management**: Redux Toolkit (RTK Query for API caching, slices for UI state)
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **UI Primitives**: Radix UI / shadcn/ui components
- **Search**: Fuse.js client-side fuzzy searching with 250ms debounce
- **Linter**: Oxlint (`npm run lint`)
- **Formatter**: Prettier (`npm run format`, check with `npm run format:check`)
- **Type Checker**: TypeScript Compiler (`npm run type-check` / `tsc -b --noEmit`)
- **Build**: `npm run build`

## 2. Directory Structure

```
src/
├── components/
│   ├── agenthub/   --> Domain-specific UI (cards, filters, telemetry, header)
│   ├── compare/    --> Staging dock and comparison tables
│   ├── layout/     --> Navigation bars and Feature Menu Drawer
│   └── ui/         --> shadcn/ui reusable primitives (badge, button, dialog, etc.)
├── features/
│   ├── directory/  --> Main catalog page with faceted filtering
│   ├── profile/    --> Detailed technical audit page for individual agents
│   ├── compare/    --> Side-by-side comparison matrix across 5 parameters
│   └── submit/     --> Contributor intake portal with 12h SLA review
├── store/
│   ├── api/        --> RTK Query API slice (agentsApi.ts)
│   ├── slices/     --> Redux state slices (appSlice.ts, compareSlice.ts)
│   └── store.ts    --> Root Redux store configuration
└── types/          --> TypeScript interfaces aligned with backend Pydantic models
```

## 3. Strict Rules & Invariants

1. **Type Parity**: All TypeScript interfaces in `src/types/` must mirror backend Pydantic response schemas.
2. **RTK Query Cache Tags**: Mutating actions (e.g. upvotes, submissions, reviews) must invalidate corresponding cache tags (`['Agents', 'Agent']`).
3. **No Direct State Mutation**: Always use Redux actions or local React state hooks.
4. **Clean Code & Formatting**: All code must pass `npm run type-check` and match Prettier formatting (`npm run format:check`).

