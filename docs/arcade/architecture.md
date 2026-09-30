# Arcade & Mini-Games Section — Technical Architecture

## Architectural Overview

The **Arcade & Mini-Games** feature is built as a modular frontend feature inside `frontend/src/features/arcade/ArcadePage.tsx`, integrated with the existing layered Redux Toolkit store (`appSlice.ts`), modal containers, and full-stack URL parameter synchronization in `App.tsx`.

```
                    ┌────────────────────────────┐
                    │          App.tsx           │
                    │   (URL Router & Modals)    │
                    └─────────────┬──────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│  HeaderNav.tsx   │    │    Navbar.tsx    │    │   ArcadePage.tsx     │
│ (Arcade Tab: 4)  │    │ (Arcade Tab: 4)  │    │  (Catalog & Cards)   │
└────────┬─────────┘    └────────┬─────────┘    └──────────┬───────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │     appSlice.ts       │
                     │  - activeView         │
                     │  - isTetrisOpen       │
                     │  - isHardestGameOpen  │
                     │  - isInvokerOpen      │
                     │  - isPudgeOpen        │
                     └───────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┬──────────────────────┐
         │                       │                       │                      │
         ▼                       ▼                       ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────────┐   ┌───────────────────────┐
│  TetrisModal    │    │ HardestGameModal│    │ InvokerTrainerModal  │   │ PudgeHookTrainerModal │
│ (Canvas 2D SRS) │    │ (Crashout Video)│    │ (Web Audio Synthesizer)  │ (2D Chain Physics)    │
└─────────────────┘    └─────────────────┘    └──────────────────────┘   └───────────────────────┘
```

---

## State & Route Integration

### 1. Active View State (`appSlice.ts`)

```typescript
export type ActiveView = 'directory' | 'profile' | 'compare' | 'collections' | 'submit' | 'arcade'
```

- When `activeView === 'arcade'`, the URL dynamically reflects `?view=arcade`.
- Navigation items in `HeaderNav.tsx` and `Navbar.tsx` highlight the active state and update the browser history via `window.history.pushState`.

### 2. Global Modal Control

Each game's execution modal is isolated and mounted globally at the root of `App.tsx`:
- `isTetrisOpen`: Controls `TetrisModal.tsx`
- `isHardestGameOpen`: Controls `HardestGameModal.tsx`
- `isInvokerOpen`: Controls `InvokerTrainerModal.tsx`
- `isPudgeOpen`: Controls `PudgeHookTrainerModal.tsx`

This ensures that games can be opened from the dedicated `ArcadePage`, from the search bar triggers, or from global keyboard shortcuts (<kbd>Alt+T</kbd>, <kbd>Alt+I</kbd>) without unmounting or losing application state.

---

## Game Subsystems & Telemetry

### 1. Classic Tetris
- **Matrix Representation**: 10x20 numerical array tracking active and static minos.
- **SRS Wall Kicks**: Standard 5-point kick testing table for I, J, L, S, T, Z pieces.
- **Ghost Piece**: Computed drop projection column-wise.
- **Persistence**: `localStorage.getItem('agenthub_tetris_highscore')`.

### 2. The World's Hardest Game
- **Physics Loop**: 60 FPS requestAnimationFrame canvas renderer.
- **Collision Detection**: Axis-Aligned Bounding Box (AABB) between player square, circular hazard nodes, and key pickups.
- **Video Crashout**: HTML5 `<video>` embedding `doggie-crashout.mp4` (1.8s duration, synced to KzX *Stalemate* drop) triggered immediately upon collision.

### 3. Dota 2 Invoker Spell Trainer
- **3-Orb Buffer**: FIFO elemental queue `[Orb1, Orb2, Orb3]` rendered with 3D glowing CSS gradients.
- **Order-Independent Spell Resolution**: Sorts active elements (e.g. `['Exort', 'Exort', 'Quas']` $\rightarrow$ `Forge Spirit`) to match canonical Dota 2 invocation.
- **Audio Synthesizer**: Zero-dependency Web Audio API procedural sound engine with oscillator nodes (sine, triangle, sawtooth) and gain envelopes.
- **Persistence**: `localStorage.getItem('agenthub_invoker_highscores')` storing `novice`, `magus`, and `grandmaster` scores.

### 4. Dota 2 Native Steam Launcher
- **Protocol Dispatch**: Dispatches `steam://run/570` to the operating system's registered application handler.
- **Safety**: Wrapped in try/catch and non-blocking timeout confirmation toast to notify user that the protocol was invoked.

### 5. Dota 2 Pudge Meat Hook Precision Trainer
- **2D Canvas Chain Physics**: Dynamic multi-segment bone/iron chain calculation and rotating butcher meat hook head with bloody barb.
- **Target Velocity & Leading**: 6 unit classes (Creeps, Crystal Maiden, Sniper, Windranger, Anti-Mage, Courier) traversing river lanes with variable speeds, hitboxes, and special mechanics (Anti-Mage blink juking).
- **Collision & Drag Retraction**: AABB/circle intersection tests on extension; latched targets are dragged back across the river to Pudge upon impact.
- **Procedural Sound Synthesis**: Launch whoosh, metallic chain rattles, flesh impact squelch, and celebratory combo fanfare generated dynamically via Web Audio API.
- **Persistence**: `localStorage.getItem('agenthub_pudge_highscore')`.
