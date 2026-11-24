# Community Submission Portal — Architecture

## Overview

The Community Submission Portal (`SubmissionPage.tsx` and `SubmitAgentModal.tsx`) manages contributor intake through client validation, bot mitigation verification, Pydantic v2 schema checks, XSS Markdown sanitization, and persistence into `backend/data/agents.json` with `lifecycle_state = "pending"` and a 12-hour review SLA.

```mermaid
sequenceDiagram
  autonumber
  participant Maintainer as Contributor / Maintainer
  participant UI as React Form (SubmissionPage / SubmitAgentModal)
  participant RTK as RTK Query (useSubmitAgentMutation)
  participant Router as FastAPI (/api/submissions)
  participant Service as SubmissionService
  participant Store as JSON Store (backend/data/agents.json)

  Maintainer->>UI: Fills metadata, telemetry, brief & anti-bot check
  UI->>RTK: submitAgentMutation(payload)
  RTK->>Router: POST /api/submissions
  Router->>Service: Validate Pydantic schema & bot_token
  Service->>Service: Strip <script>/<iframe>/<style> XSS tags & generate unique slug
  Service->>Store: Append AgentInDb (lifecycle_state="pending")
  Store-->>Service: Persisted record
  Service-->>UI: 201 Created (submission_id, slug, sla_hours=12)
  UI-->>Maintainer: Render 12h SLA Confirmation Card
```

---

## Moderation Lifecycle State Machine

```mermaid
stateDiagram-v2
  [*] --> pending: POST /api/submissions
  pending --> approved: Technical Audit Passed (<12h SLA)
  pending --> rejected: Spam / Non-Autonomous Wrapper
  approved --> archived: SyncService Detects Archived GitHub Repo
```

---

## Schema Validation & Security (`SubmissionCreateRequest`)

- **Field Constraints**: `title` (2–150 chars), `tagline` (5–255 chars), `summary` (≤ 120 chars), `description_markdown` (≥ 20 chars), valid `http(s)://` URLs for `website_url` / `repository_url`, regex-validated `submitter_email`, and verified `category_id` (UUID or category slug).
- **Bot Mitigation**: Rejects automated abuse tokens (`bot_token == "bot_fail"` → `403 Forbidden`).
- **XSS Sanitization**: `SubmissionService.submit_agent` strips `<script>`, `<iframe>`, and `<style>` blocks from `description_markdown` prior to persistence.

---

## API Surface

| Method | Endpoint | Request Schema | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions` | `SubmissionCreateRequest` | `201 Created` (`SubmissionResponse`) | Commit a new agent to the `pending` moderation queue with 12h SLA |
