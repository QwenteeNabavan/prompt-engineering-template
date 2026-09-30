# Curated Collections & Comparisons — Business Requirements

## Purpose

Empower developers, architects, and technical decision-makers to evaluate competing AI agents side-by-side using standardized engineering benchmarks, and discover specialized solutions through curated industry roundups.

## Business Need

- **Evaluate Complex Trade-Offs**: Choosing an AI agent involves nuanced technical criteria (token costs, vector memory, execution autonomy) that cannot be captured by simple star ratings.
- **Side-by-Side Staging**: Enable users to stage 2 or 3 solutions within the same domain to inspect structural differences without flipping between disparate GitHub repositories.
- **Editorial Discovery**: Provide curated thematic collections (e.g., "Top Open-Source Browser Automation Agents", "Offline Local Refactoring Tools") to guide organic search discovery and SEO indexing.

---

## Functional Requirements

### Curated Collections (`/collections` & `/collections/[slug]`)

| ID | Requirement |
|----|-------------|
| BR-CP-01 | **Collection Index**: Present an editorial showcase of curated collections categorized by industry use-case and technical profile. |
| BR-CP-02 | **Collection Detail**: Display an editorial overview, curated criteria summary, and an ordered list of featured agents with custom editorial annotations. |
| BR-CP-03 | **One-Click Staging**: Provide an action button on collections allowing users to pre-populate the interactive comparison matrix with all featured tools from the roundup. |

### Interactive Comparison Matrix (`/compare`)

| ID | Requirement |
|----|-------------|
| BR-CP-04 | **Staging Limit**: Allow users to select and stage a minimum of 2 and maximum of 3 agents simultaneously for comparison. |
| BR-CP-05 | **Category Affinity Enforcement**: Warn or prompt the user if comparing agents from radically divergent operational domains (e.g. comparing a Web Browser agent to a Sales Outreach agent) to promote meaningful comparisons. |
| BR-CP-06 | **Parameter Matrix**: Compare the staged agents across 5 standardized engineering parameters: |
| | 1. **Degree of Execution Autonomy**: Autonomous loop depth, human-in-the-loop escalation mechanisms. |
| | 2. **Vector Memory & RAG Integration**: Built-in long-term embedding stores, context recall strategies. |
| | 3. **Multimodal Asset Handling**: Vision, audio, and file artifact parsing capabilities. |
| | 4. **Estimated Token Consumption Overhead**: Baseline token consumption per standard execution step. |
| | 5. **Community Maintenance Cadence**: Release velocity, commit frequency, issue resolution speed. |
| BR-CP-07 | **Export & Shareability**: Enable users to generate a permalink or copy a markdown comparison summary for architectural design documents (ADRs). |

---

## Non-Goals

- Real-time cloud sandbox benchmarking during user comparison (metrics are pre-audited and stored in the catalog).
- Subjective sponsored placements (curated roundups must meet strict editorial standards).

---

## Success Criteria

- Users can configure and view a 2-way or 3-way comparison matrix in under 3 clicks.
- Comparison matrix supports instant permalink sharing (e.g. `/compare?agents=devin,open-devin`).
- Comparative telemetry parameters render consistently across mobile, tablet, and desktop viewports.

