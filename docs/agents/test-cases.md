# Agents Directory & Profiles — Test Cases

Comprehensive test cases for the Agents Directory, Filtering, Profiles, Ranking, and Synchronization feature.

---

## Directory & Search Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-AG-S01 | Centralized Search Hotkey | Press `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux) | Global search bar immediately receives focus; input caret active. |
| TC-AG-S02 | Debounced Fuzzy Search | Type "langg" into the search bar | After a 250ms debounce pause, Fuse.js filters the grid to match "LangGraph" agents in <50ms without UI stutter. |
| TC-AG-S03 | Category Filtering | Select category `Coding & DevOps` | Only agents tagged with `Coding & DevOps` are displayed; URL updates with `?category=coding-devops`. |
| TC-AG-S04 | Multi-Facet Filtering | Select `Local Terminal CLI` and `Fully Open-Source` simultaneously | Agent grid narrows to records satisfying both runtime and licensing criteria. |
| TC-AG-S05 | Reset Filters | Click "Clear all filters" | Grid resets to complete active catalog; URL query parameters are cleared. |
| TC-AG-S06 | Agent Card Visual Contract | Inspect rendered card in directory | Card contains square brand icon, verified status badge, summary text <= 120 characters, framework chips, and GitHub star counter. |

---

## Detailed Profile Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-AG-P01 | Profile Navigation | Click on an agent card in the homepage grid | Immediate client-side routing to `/agents/[slug]`; page loads in under 1 second. |
| TC-AG-P02 | Telemetry Grid Integrity | View technical audit section | Correctly renders license type, supported LLMs (Claude, GPT, Llama, DeepSeek, Ollama), framework (e.g. LangGraph), MCP compliance badge, and minimum hardware requirements. |
| TC-AG-P03 | Copyable Terminal Setup | Click "Copy" on the terminal setup sequence snippet | Code snippet copied to system clipboard; toast notification "Copied to clipboard" appears. |
| TC-AG-P04 | Strengths & Edge Cases | Review architectural documentation section | Section displays balanced strengths alongside known operational edge cases (e.g. high context consumption, DOM shift sensitivity). |
| TC-AG-P05 | Contextual Alternatives | Scroll to bottom of agent profile | Section displays up to 4 alternative agents belonging to the same category. |
| TC-AG-P06 | Outbound Attribution Link | Click external official domain link | Link opens in new tab with platform referral tracking parameters appended (e.g., `?ref=agenthub`). |

---

## Upvoting & Deduplication Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-AG-V01 | First Upvote (Fingerprint) | Click upvote button as an anonymous user | Upvote counter increments by 1; active state persists in local storage and database `upvotes` table. |
| TC-AG-V02 | Duplicate Vote Prevention | Attempt to click upvote on the same agent again | Action toggles/revokes the vote or returns `409 Conflict`; duplicate entry in `upvotes` table is rejected. |
| TC-AG-V03 | Authenticated Upvote | Sign in as user and upvote an agent | Record inserted with `user_id` and `agent_id`; unique constraint `(agent_id, user_id)` prevents re-voting. |
| TC-AG-V04 | Upvote Rollback on Failure | Simulate network failure or server error during upvote | Optimistic UI increment rolls back to original count; error toast displayed to user. |

---

## Ranking & Background Sync Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-AG-R01 | Time-Decay Score Calculation | Calculate score for agent with 10 upvotes in 7 days, created 24 hours ago | Score matches formula: $(10 + 1) / (24 + 2)^{1.5} \approx 11 / 132.57 \approx 0.083$. |
| TC-AG-R02 | Trending Surge | New agent receives 50 upvotes within 2 hours of approval | Dynamic ranking score surges ahead of older agents with higher total historical votes but lower rolling 7-day velocity. |
| TC-AG-R03 | Nightly GitHub Sync Cron | Run scheduled background job against records with GitHub URLs | Star count updated from GitHub API; `updated_at` refreshed. |
| TC-AG-R04 | Upstream Repository Archival | Run sync job against an agent whose upstream GitHub repository is archived | Background job detects `archived: true` via GitHub API; sets `is_archived = true` in DB and demotes/hides from default listing. |

