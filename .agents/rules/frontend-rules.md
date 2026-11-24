---
trigger: glob
globs: "frontend/**"
description: React 19, TypeScript, RTK Query server state, Fuse.js search, and shadcn/ui rules for frontend files.
---
<!-- [DEMO-02B] Path-Scoped Frontend Rules (loaded only when working in frontend/**) -->
# Frontend Architecture & Engineering Rules

1. **State Management Separation**:
   - **Server State**: All HTTP reads and mutations must go through RTK Query in `frontend/src/store/api/agentsApi.ts` with tag invalidation (`Agent`, `Category`, `Collection`, `Review`). Never simulate API submissions with `setTimeout` or hardcode catalog state when the API is reachable.
   - **Client UI State**: Use Redux slices (`appSlice.ts`, `compareSlice.ts`) strictly for ephemeral UI state (active view, URL-synced filters, staged comparison slugs up to max 3).
2. **Search, Accessibility & Styling**:
   - Debounce search inputs by **250ms** before executing `Fuse.js` client-side fuzzy matching.
   - Support `Cmd+K` / `Ctrl+K` command palette activation and `Escape` modal dismissal, with `aria-label` on icon-only controls.
   - Compose UI with Tailwind CSS v4 utilities and reusable primitives in `frontend/src/components/ui/`.
3. **Quality Gate**:
   - Run `npm run check` (`oxlint --deny-warnings`, `prettier --check`, `tsc -b --noEmit`) and `npm run build` from `frontend/`.
