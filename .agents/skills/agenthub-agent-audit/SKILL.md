---
name: agenthub-agent-audit
description: >-
  Use this skill when auditing, cataloging, adding, or modifying an autonomous AI agent in the AgentHub platform.
  Guides evaluating the 5 engineering parameters, Model Context Protocol (MCP) compliance, hardware requirements,
  terminal setup sequences, and operational edge cases.
---

# AgentHub Autonomous Agent Technical Audit Skill

This skill provides a standardized runbook for technical evaluations of autonomous AI agents submitted to or listed on AgentHub.

## Audit Workflow

### Step 1: Autonomy Verification
Confirm the system meets the core AgentHub differentiator:
- Does the agent possess deliberate multi-step planning?
- Can it invoke tools (APIs, terminals, browser sandboxes) autonomously?
- Does it maintain contextual memory across execution steps?
*(Reject or reclassify simple prompt wrappers or one-off completion tools).*

### Step 2: Benchmark Telemetry Classification
Evaluate against the standardized [Telemetry Matrix](./references/telemetry-matrix.md):
1. **Autonomy Level**: `fully_autonomous` | `semi_autonomous` | `copilot`
2. **Vector Memory / RAG**: Determine `has_vector_rag` and `memory_backend` (e.g. Chroma, FAISS, Milvus).
3. **Multimodal Grounding**: List supported modalities (`screenshots`, `browser_dom`, `pdf_parsing`, `file_diffs`).
4. **Token Overhead Tier**: Classify into `low`, `moderate`, or `heavy`.
5. **Community Cadence**: Check commit frequency and release velocity (`weekly_releases`, `monthly_releases`, `infrequent`).
6. **Model Context Protocol**: Verify native client/server MCP support (`is_mcp_compliant`).

### Step 3: Local Bootstrapping Sequence
Formulate a minimal, copyable terminal snippet to bootstrap the agent in an isolated local environment (e.g. Docker run or standard package manager command).

### Step 4: Candid Strengths & Operational Edge Cases
Document at least 2 architectural strengths and 2 known operational edge cases (e.g., token consumption spikes, sensitivity to anti-bot challenges or dynamic DOM shifts).

### Step 5: Directory Record Insertion
Format the audited solution matching `AgentInDb` schema and commit to `backend/data/agents.json` or submit through `/api/submissions`.
