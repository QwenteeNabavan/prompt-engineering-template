---
name: fullstack-verification
description: >-
  Use this skill when verifying the full-stack health of AgentHub across the FastAPI backend and React frontend.
  Runs database integrity checks, backend test suites, and frontend TypeScript build validation.
---

# AgentHub Full-Stack Verification Skill

This skill provides an automated, one-shot procedure to verify that all AgentHub services, APIs, and user interfaces are operating cleanly with zero errors.

## Verification Workflow

### Option 1: Automated Script Execution
Run the verification helper script:
```bash
python .agents/skills/fullstack-verification/scripts/verify-all.py
```
This script sequentially validates:
1. JSON storage array integrity (`agents.json`, `categories.json`, `collections.json`, `upvotes.json`).
2. Backend API test suite (`uv run python test_api.py`).
3. Frontend TypeScript checking and Vite compilation (`npm run build`).

### Option 2: Step-by-Step Manual Verification
1. **Backend Tests**:
   ```bash
   cd backend && uv run python test_api.py
   ```
2. **Frontend Build**:
   ```bash
   cd frontend && npm run build
   ```
3. **Data Integrity Inspection**:
   Inspect `backend/data/*.json` to ensure valid JSON arrays.
