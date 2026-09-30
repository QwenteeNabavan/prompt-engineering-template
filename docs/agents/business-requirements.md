# Agents Directory & Profiles — Business Requirements

## Purpose

Deliver a specialized directory and technical audit platform for autonomous and semi-autonomous AI agents. Unlike generic AI aggregators that catalogue simple LLM wrappers, AgentHub showcases agents with deliberate planning, external tool execution (via APIs or web browsers), long-term contextual memory, and multi-step execution capabilities without constant human supervision.

## Business Need

- **Resolve Ecosystem Fragmentation**: Agent solutions are dispersed across GitHub repos, Discord servers, and unpolished CLI repositories without standardized specifications.
- **Clarify Operational Barrier to Entry**: Enable developers and enterprise teams to quickly ascertain whether an agent requires local GPU hardware, Docker self-hosting, or exists as a managed cloud SaaS.
- **Surface Crucial Technical Capabilities**: Provide immediate visibility into supported foundation models, orchestrator frameworks (LangGraph, CrewAI, AutoGen, custom), Model Context Protocol (MCP) compliance, and real operational token overhead.
- **Dynamic Discovery & Freshness**: Overcome directory stagnation where early projects permanently dominate rankings, using authentic community upvotes combined with exponential time-decay ranking and automated GitHub repository health tracking.

---

## Functional Requirements

### Homepage & Directory (`/` or `/agents`)

| ID | Requirement |
|----|-------------|
| BR-AG-01 | **Hero & Metrics**: Display a concise hero section communicating the core value proposition alongside live counters for total verified solutions and active community votes. |
| BR-AG-02 | **Centralized Search**: Provide a top-level search bar with global hotkey activation (e.g. `Cmd+K` / `Ctrl+K`), debounced client-side fuzzy search (250ms debounce window), matching agent titles, tags, and frameworks with sub-second response times (<50ms). |
| BR-AG-03 | **Category Filter**: Filter agents by functional domain: `Coding & DevOps`, `Web & Browser Automation`, `Deep Research & Data Analysis`, `Sales & Outreach`, and `Core Multi-Agent Frameworks`. |
| BR-AG-04 | **Runtime Environment Filter**: Filter agents by execution target: `Cloud SaaS (Web GUI)`, `Local Terminal CLI`, `Self-Hosted Docker Compose`, and `IDE Extensions (VS Code / Cursor)`. |
| BR-AG-05 | **Monetization & Licensing Filter**: Filter agents by licensing model: `Fully Open-Source`, `Bring Your Own Key (BYOK)`, `Freemium`, and `Commercial Subscription`. |
| BR-AG-06 | **Agent Grid Card**: Render responsive cards with square brand icon, verified project status badge, summary text capped at 120 characters, technology stack chips, synchronized GitHub star counter, and a persistent upvote button. |
| BR-AG-07 | **Navigation**: Clicking any card immediately navigates client-side to the comprehensive agent profile page. |

### Agent Profile (`/agents/[slug]`)

| ID | Requirement |
|----|-------------|
| BR-AG-08 | **Profile Header**: Display the full project name, extended tagline, external official domain link (appending platform attribution/tracking parameters), source repository link, one-click share action, and upvote button. |
| BR-AG-09 | **Technical Telemetry Grid**: Present structured telemetry: precise license type, supported foundation models (Claude, GPT, Llama, DeepSeek, local Ollama), orchestrator framework (LangGraph, CrewAI, AutoGen, custom), native MCP support status, and minimum hardware specifications required for stable execution. |
| BR-AG-10 | **Core Capabilities Section**: Detail the agent’s autonomous end-to-end execution capabilities and planning mechanics. |
| BR-AG-11 | **Terminal Setup Sequence**: Provide a copyable terminal setup sequence for rapid local environment bootstrapping. |
| BR-AG-12 | **Strengths & Edge Cases**: Present a balanced, validated technical breakdown of architectural strengths and known operational edge cases (e.g., sensitivity to dynamic DOM shifts, high context token consumption). |
| BR-AG-13 | **Contextual Alternatives**: Render recommendation cards for alternative agents belonging to the same functional category. |
| BR-AG-14 | **Community Reviews**: Render an authenticated user review feed allowing community feedback and ratings. |

### Upvoting, Ranking & Maintenance

| ID | Requirement |
|----|-------------|
| BR-AG-15 | **Deduplicated Upvoting**: Allow users to upvote an agent once. Upvotes are linked to either an authenticated user ID or a hashed client digital footprint. |
| BR-AG-16 | **Time-Decay Discovery Ranking**: Calculate trending scores dynamically using an exponential time-decay formula to boost newly surging solutions and prevent legacy stagnation. |
| BR-AG-17 | **Automated Nightly Synchronization**: Automatically query GitHub APIs for active approved records to update star counts and flag/deactivate archived repositories. |

---

## Client-Side Validation & Interaction

- Search query inputs are sanitized, trimmed, and debounced at 250ms.
- Upvote buttons display immediate optimistic visual state toggling with reversible error rollback if the backend rejects the vote.
- Filter selections are synchronized bidirectionally with URL search parameters for shareable, bookmarkable deep links.

---

## Non-Goals

- In-browser agent runtime execution (AgentHub catalogues and benchmarks agents; it does not host arbitrary agent sandbox executions).
- Automatic code patching or repository forks.
- Unmonitored, instant public publishing (all submissions undergo moderation).

---

## Success Criteria

- Sub-50ms search latency on client-side catalog filtering for catalogs up to 1,000 entities.
- Sub-second initial page load performance.
- Upvote deduplication reliably blocks repeat votes across user sessions and digital fingerprints.
- Nightly synchronization keeps star counts up to date and deactivates abandoned/archived projects automatically.

