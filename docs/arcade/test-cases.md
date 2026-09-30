# Arcade & Mini-Games Section — Test Cases

## Test Matrix

| ID | Test Scenario | Steps | Expected Outcome | Status |
|----|---------------|-------|------------------|--------|
| **TC-ARC-01** | Navigation via HeaderNav | Click "Arcade" in top landing page navigation. | Active view transitions to Arcade, URL updates to `?view=arcade`, and ArcadePage renders. | PASS |
| **TC-ARC-02** | Navigation via Navbar | Click "Arcade" in Navbar on a subpage (e.g. `/compare`). | Active view transitions to Arcade and Arcade tab is highlighted with badge `4`. | PASS |
| **TC-ARC-03** | URL Direct Deep Linking | Navigate to `http://localhost:5174/?view=arcade` directly. | App initializes with active view set to Arcade without console errors. | PASS |
| **TC-ARC-04** | Launch Classic Tetris | Click "Play Classic Tetris" button on ArcadePage card. | `TetrisModal` opens. Canvas renders 10x20 grid, controls respond, and high score persists. | PASS |
| **TC-ARC-05** | Launch The World's Hardest Game | Click "Launch Hardest Game" button on ArcadePage card. | `HardestGameModal` opens. Level 1 starts, player square moves via WASD/Arrows, death triggers 1.8s Doggie crashout video. | PASS |
| **TC-ARC-06** | Launch Invoker Spell Trainer | Click "Practice Invoker Combos" button on ArcadePage card. | `InvokerTrainerModal` opens. 3 difficulty tabs work, Q/W/E trigger procedural audio, and scores update. | PASS |
| **TC-ARC-07** | Launch Dota 2 via Steam Protocol | Click "Launch Dota 2 via Steam" button on ArcadePage card. | Browser triggers `steam://run/570` protocol and displays launch confirmation toast. | PASS |
| **TC-ARC-08** | Global Shortcut Alt+T | Press <kbd>Alt+T</kbd> anywhere on ArcadePage. | Tetris modal launches immediately. | PASS |
| **TC-ARC-09** | Global Shortcut Alt+I | Press <kbd>Alt+I</kbd> anywhere on ArcadePage. | Invoker Trainer modal launches immediately. | PASS |
| **TC-ARC-10** | High Score Persistence | Score points in Tetris/Invoker and refresh the page. | High scores are read from `localStorage` and reflected in the ArcadePage hero metrics bar. | PASS |
| **TC-ARC-11** | Reset High Scores | Click "Clear Records" and confirm dialog. | High scores are cleared from `localStorage` and reset to 0 in UI. | PASS |
| **TC-ARC-12** | Secret Triggers Click-to-Copy | Click any secret trigger card in the Easter Eggs directory. | Shortcut text is copied to clipboard and a green checkmark indicator appears. | PASS |
| **TC-ARC-13** | Launch Pudge Hook Trainer | Click "Launch Pudge Hook Trainer" or press <kbd>Alt+P</kbd>. | `PudgeHookTrainerModal` opens. Canvas renders river, moving targets, and Pudge aiming arm. | PASS |
| **TC-ARC-14** | Hook Throw & Retract Mechanics | Left-click or press <kbd>Q</kbd> to throw hook. | Hook extends along mouse angle. On target contact, plays flesh squish, blood particles, and pulls target back to Pudge. | PASS |
| **TC-ARC-15** | Pudge Telemetry & Mode Switching | Switch between 60s Blitz, 3 Strikes, and Free Training. | Mode timers, miss lives, speed slider, and high score in `localStorage` work correctly. | PASS |
