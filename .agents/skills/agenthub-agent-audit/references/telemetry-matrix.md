# AgentHub Engineering Telemetry Matrix Reference

Standardized benchmarking rubrics for evaluating autonomous AI agents.

---

## 1. Degree of Execution Autonomy

| Tier | Value | Definition | Criteria |
|---|---|---|---|
| Level 3 | `fully_autonomous` | Unsupervised Multi-Step Loop | Executes multi-step workflows, installs tools/packages, debugs failures, and finishes tasks without requiring human approvals at each step. |
| Level 2 | `semi_autonomous` | Human-in-the-Loop Gating | Autonomously plans and executes actions, but requires explicit human confirmation for sensitive operations (file writes, shell commands, API commits). |
| Level 1 | `copilot` | Suggestive / Single-Step | Generates completions or one-off code snippets; relies on the human to run commands and guide execution. |

---

## 2. Vector Memory & RAG Integration

| Criterion | Field | Expected Values | Notes |
|---|---|---|---|
| RAG Support | `has_vector_rag` | `true` / `false` | True if agent integrates long-term embedding stores or codebase indexers. |
| Backend Store | `memory_backend` | String (or null) | e.g. `Chroma Vector DB`, `Milvus`, `FAISS`, `pgvector`, or `Persistent Knowledge Graph`. |

---

## 3. Multimodal Asset Handling

Array of supported input/output modalities (`multimodal_capabilities`):
- `screenshots`: Vision-based webpage or desktop screenshot inspection.
- `browser_dom`: Direct DOM tree distillation and accessibility tree parsing.
- `pdf_parsing`: Reading and analyzing multi-page PDF documents.
- `file_diffs`: Generating and applying unified code diffs.
- `audio`: Processing spoken commands or generating audio responses.

---

## 4. Estimated Token Consumption Overhead

| Tier | Value | Token Range per Step | Typical Use-Case |
|---|---|---|---|
| Low | `low` | < 2,000 tokens/step | Focused DOM actions, single-tool lookups, semantic selectors. |
| Moderate | `moderate` | 2,000 – 10,000 tokens/step | Multi-file code edits, parallel scraping, research synthesis. |
| Heavy | `heavy` | > 10,000 tokens/step | Full repository context stuffing, high-resolution vision loops, multi-agent swarms. |

---

## 5. Model Context Protocol (MCP) Compliance

An agent is marked `is_mcp_compliant: true` if:
1. It implements the Anthropic/Linux Foundation Model Context Protocol specification.
2. It can consume standard external MCP tool servers via stdio or SSE.
3. It can expose its own capabilities as an MCP server to client environments.
