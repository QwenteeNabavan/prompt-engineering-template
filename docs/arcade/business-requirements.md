# Arcade & Mini-Games Section — Business Requirements

## Purpose

Deliver a dedicated interactive arcade and reflex training section directly inside AgentHub. The arcade centralizes developer break-room games, algorithmic puzzle simulations, esports reaction trainers, and system integration easter eggs into a first-class, easily accessible platform module.

## Business Need

- **Developer Engagement & Retention**: Provide engaging developer break-room simulations (Classic Tetris, The World's Hardest Game, and Dota 2 Invoker Spell Trainer) that keep technical users engaged and returning to AgentHub.
- **Showcasing Client-Side Web Capabilities**: Demonstrate high-performance browser capabilities without external libraries: HTML5 Canvas 2D collision physics, Super Rotation System (SRS) matrix algorithms, procedural Web Audio API sound synthesis, and desktop OS protocol bridges (`steam://`).
- **Standardized Game & Easter Egg Discovery**: Organize easter eggs that were previously discoverable only via hidden shortcuts or secret search queries into a curated, discoverable catalog with clear keybindings and high-score tracking.

---

## Functional Requirements

### Dedicated Arcade View (`?view=arcade`)

| ID | Requirement |
|----|-------------|
| BR-ARC-01 | **Dedicated Route & View Switching**: The arcade module is accessible via `?view=arcade` with full bidirectional Redux synchronization and browser back/forward history support. |
| BR-ARC-02 | **Global Navigation Visibility**: Exposed via an "Arcade" navigation tab in both `HeaderNav` (with active game counter badge) and `Navbar` across all subpages. |
| BR-ARC-03 | **Live Telemetry & High Score Tracking**: Display live aggregate metrics including total active games, local Tetris high score, Invoker Spell Trainer high scores across 3 difficulty tiers, and level progression. |
| BR-ARC-04 | **Instant Game Launch Triggers**: Provide dedicated one-click launch buttons for all four games without leaving the arcade catalog. |
| BR-ARC-05 | **Easter Egg & Shortcut Directory**: Present a searchable/interactive directory of all global keyboard shortcuts (<kbd>Alt+T</kbd>, <kbd>Alt+I</kbd>, <kbd>Cmd+K</kbd>) and search triggers (`"game"`, `"invoker"`, `"dota"`, `"Discover"`). |
| BR-ARC-06 | **Local Storage Reset**: Allow developers to reset local high scores for testing or clean benchmark runs. |

### Game Modules Catalog

| Game Module | Engine / Architecture | Key Features |
|-------------|-----------------------|--------------|
| **Classic Tetris** | HTML5 Canvas 2D | 10x20 grid, SRS wall kicks, ghost piece prediction, soft/hard drops, progressive gravity, persistent high scores. |
| **The World's Hardest Game** | 60 FPS Canvas Physics | 4 handcrafted hazard levels, oscillating blue nodes, golden coin objectives, 1.8s Doggie crashout video loss clip synced to KzX *Stalemate*. |
| **Dota 2 Invoker Spell Trainer** | React + Web Audio API | 10 canonical spells, 3 difficulty tiers (Novice 6.0s + hints, Magus 2.5s, Grandmaster 1.3s sudden death), dynamic 3-orb chamber, procedural sound synthesis, ms telemetry. |
| **Dota 2 Pudge Meat Hook Trainer** | HTML5 Canvas 2D + Web Audio | 2D multi-link chain physics, target leading, 6 moving unit types (Creeps, CM, Sniper, Windranger, Anti-Mage, Courier), blood splatter, 3 modes (60s Blitz, 3 Strikes, Free Training), accuracy % telemetry. |
| **Dota 2 Steam Launcher** | Browser Protocol Bridge | Direct system bridge executing `steam://run/570` to launch the native desktop Dota 2 client with confirmation toast. |
