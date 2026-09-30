# Curated Collections & Comparisons — Test Cases

Comprehensive test cases for Curated Collections, Staging Dock, and Side-by-Side Comparative Matrix.

---

## Curated Collections Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-CP-COL01 | Collections Index Render | Navigate to `/collections` | Renders grid of published curated collections with titles, summaries, and featured agent badges. |
| TC-CP-COL02 | Collection Detail View | Click on "Top Open-Source Browser Automation Agents" | Opens collection detail page showing editorial introduction and ordered list of featured agents. |
| TC-CP-COL03 | Staging from Collection | Click "Compare All in Roundup" button on a 3-agent collection | Pre-populates the comparison dock with all 3 agents and navigates directly to `/compare?agents=slug1,slug2,slug3`. |

---

## Comparison Staging & Limits Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-CP-STG01 | Add Agent to Comparison | Click "Compare" button on any agent card | Agent added to floating staging dock; counter updates to `1/3`. |
| TC-CP-STG02 | Minimum Staging Guard | Navigate to `/compare` with only 1 agent staged | Prompts user: "Please select at least 2 agents to initiate comparison." |
| TC-CP-STG03 | Maximum Staging Enforced | Stage 3 agents, then attempt to click "Compare" on a 4th agent | Action blocked; toast notification displayed: "Maximum 3 agents can be compared at once." |
| TC-CP-STG04 | Remove from Dock | Click the "X" remove icon on a staged agent chip | Agent removed from staging dock; counter decrements. |

---

## Comparison Matrix Test Cases

| ID | Test Scenario | Steps | Expected Outcome |
|----|---------------|-------|------------------|
| TC-CP-MTX01 | Two-Agent Matrix Render | Load `/compare?agents=agent-a,agent-b` | Two-column comparative matrix renders displaying values across all 5 parameters: Autonomy, Memory/RAG, Multimodal, Token Overhead, Maintenance Cadence. |
| TC-CP-MTX02 | Three-Agent Matrix Render | Load `/compare?agents=agent-a,agent-b,agent-c` | Three-column comparative matrix renders properly aligned without horizontal overflow clipping. |
| TC-CP-MTX03 | Category Discrepancy Warning | Stage agents from conflicting categories (e.g. `Coding` vs `Sales Outreach`) | Non-blocking alert banner suggests comparing agents within the same operational domain for best results. |
| TC-CP-MTX04 | Permalink Sharing | Copy URL `/compare?agents=agent-a,agent-b` and paste into an incognito browser window | Matrix renders the exact same comparison state from URL parameters. |
| TC-CP-MTX05 | Export to Markdown | Click "Copy Comparison as Markdown" button | System clipboard receives formatted Markdown table summarizing the side-by-side comparison for use in Architecture Decision Records (ADRs). |

