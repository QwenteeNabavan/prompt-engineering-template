# Frontend Architecture & Engineering Rules

These rules govern all frontend development for AgentHub (`frontend/`), ensuring high visual fidelity, predictable state management, and strict TypeScript compilation.

---

## 1. Directory Structure & Feature Encapsulation

The frontend codebase is organized using a feature-driven domain structure:

```
frontend/src/
├── components/
│   ├── agenthub/      # Domain-specific reusable AgentHub widgets (cards, modals, telemetry)
│   ├── compare/       # Comparison staging dock and visual side-by-side matrices
│   ├── layout/        # Navbar, footer, and navigation containers
│   └── ui/            # Reusable UI primitives (shadcn/ui / Radix UI buttons, dialogs, badges)
├── features/          # Feature pages and containers
│   ├── arcade/        # Mini-games showcase (Tetris, Hardest Game, Invoker Trainer, Hook Trainer)
│   ├── compare/       # Side-by-side technical benchmark matrix
│   ├── directory/     # Main searchable agent catalog with multi-faceted filtering
│   ├── profile/       # Detailed technical audit view for individual agents
│   └── submit/        # 4-step community submission intake form
├── store/
│   ├── api/           # RTK Query API slice definitions (agentsApi.ts)
│   └── slices/        # Ephemeral UI client state slices (appSlice.ts, compareSlice.ts)
└── types/             # Domain TypeScript definitions (agent.ts, agent-registry.ts)
```

---

## 2. State Management Standard

1. **Server State (RTK Query)**:
   - All HTTP interactions with the backend API must be managed via RTK Query in [`frontend/src/store/api/agentsApi.ts`](file:///c:/Users/qwentee/Documents/GitHub/prompt-engineering-template/frontend/src/store/api/agentsApi.ts).
   - Use tag-based cache invalidation (`providesTags` / `invalidatesTags`) to guarantee that list views re-render automatically upon mutations (e.g. submitting an agent, upvoting).
2. **Ephemeral UI State (Redux Slices)**:
   - Use Redux slices strictly for client-only state: staged comparison entities, modal open/closed states, audio toggle preferences.
   - Do NOT duplicate backend data into slices; consume RTK Query hooks directly in components.

---

## 3. UI Styling & shadcn/ui Design System

- **Styling**: Use utility-first Tailwind CSS. Keep layout responsive (`sm:`, `md:`, `lg:` breakpoints).
- **Design Tokens**: Adhere to dark theme cybernetic / telemetry aesthetic with slate backgrounds (`bg-slate-900`, `bg-slate-950`), glowing borders (`border-cyan-500/30`), and semantic badges.
- **Component Primitives**: Always reuse shadcn/ui components (`Dialog`, `Button`, `Badge`, `Tabs`, `Card`, `Input`, `Label`) located under `src/components/ui/`.

---

## 4. Mini-Game Engineering & Canvas Rules

For interactive mini-games (Arcade, Hardest Game, Invoker Trainer, Pudge Hook Trainer):
1. **Physics & Animation Loop**:
   - Use `requestAnimationFrame` for game loops.
   - Always cancel animation frames inside `useEffect` cleanup functions (`cancelAnimationFrame(animationFrameId)`).
2. **Audio & Web Audio API**:
   - Synthesize sound effects or manage `Audio` instances with proper lifecycle cleanup.
   - Always check `AudioContext.state === 'suspended'` and resume on initial user gesture.
   - Clean up media elements on unmount to prevent audio leaks or playback overlap.
3. **Modal Dialog Lifecycle**:
   - Isolate game state inside modal components.
   - Reset gameplay counters (deaths, score, level) upon closing or reopening modals.

---

## 5. Keyboard Navigation & Accessibility

- Support global keyboard shortcuts:
  - `Cmd+K` / `Ctrl+K`: Toggle global command palette / quick search.
  - `Escape`: Close any active modal dialog or quick-view panel.
- Ensure all interactive buttons, inputs, and tab triggers have visible focus rings and accessible labels (`aria-label`).

---

## 6. Build & Compilation Verification

- Prior to committing any frontend modifications, verify that the TypeScript project compiles cleanly:
  ```bash
  cd frontend && npm run build
  ```
- The build must execute with **zero errors** across both `tsc -b` and `vite build`.
