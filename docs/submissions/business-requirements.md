# Community Submission Portal — Business Requirements

## Purpose

Provide a streamlined, secure portal for open-source maintainers, AI developers, and commercial vendors to submit emerging autonomous and semi-autonomous AI agents into the AgentHub catalog.

## Business Need

- **Organic Catalog Expansion**: Enable decentralized contributors to submit novel agent frameworks and tools directly to the directory.
- **Data Quality & Standardized Metadata**: Guarantee that every submission contains uniform technical telemetry (runtime environment, LLM backends, MCP compliance, license) before reaching human review.
- **Spam & Abuse Mitigation**: Protect the submission pipeline against automated spam, mass scraping submissions, and malicious payloads using background bot prevention and strict schema validation.
- **Maintainer Transparency**: Give contributors clear visibility into moderation status with a guaranteed 12-hour review Service Level Agreement (SLA).

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| BR-SB-01 | **Submission Form**: Expose an intuitive multi-step or sectioned submission form accessible at `/submit`. |
| BR-SB-02 | **Core Metadata Fields**: Require official project title (max 150 chars), concise preview tagline (max 255 chars), target domain classification (category select), and monetization tier (OSS, BYOK, Freemium, Commercial). |
| BR-SB-03 | **Comprehensive Product Brief**: Require a Markdown-formatted description detailing autonomous planning mechanisms, tool integration, and architectural edge cases. |
| BR-SB-04 | **Link Validation**: Require valid, reachable HTTPS URLs for the production application/landing page and public GitHub/Git repository. |
| BR-SB-05 | **Technical Specification Selectors**: Capture supported deployment targets (Cloud, CLI, Docker Compose, IDE extensions) and supported LLM backends (Claude, GPT, Llama, DeepSeek, Ollama, etc.). |
| BR-SB-06 | **Brand Asset Upload**: Accept square visual assets (brand logos) in modern image formats (`image/webp`, `image/png`, `image/svg+xml`) up to 2MB, enforcing minimum dimensions (256x256 px). |
| BR-SB-07 | **Maintainer Contact**: Require a valid maintainer email address for automated submission receipts, moderation queries, and status notifications. |
| BR-SB-08 | **Bot Mitigation**: Integrate background bot mitigation (e.g., Cloudflare Turnstile or honeypot fields + IP rate limiting) without imposing high-friction user captchas. |
| BR-SB-09 | **Pending State Commitment**: Save submitted entries with lifecycle status `pending`, preventing immediate public visibility until reviewed. |
| BR-SB-10 | **SLA Confirmation View**: Upon successful transmission, present a dedicated confirmation screen displaying the submission reference ID and highlighting the 12-hour review turnaround SLA. |

---

## Client-Side & Server-Side Validation

- **Client Validation**: Validate input lengths, URL schemas, required fields, and image formats prior to submission.
- **Server Validation**: Re-validate the entire payload against the Pydantic/Zod schema. Sanitize Markdown content to prevent cross-site scripting (XSS).
- **Slug Generation**: Automatically derive a URL-safe unique slug from the title (with random numerical suffix resolution in case of collision).

---

## Non-Goals

- Instant unmoderated auto-publishing.
- Payment gateway for paid listings (AgentHub listings are reviewed on merit; commercial status indicates the agent's pricing model, not a directory fee).
- Direct hosting of source code repositories.

---

## Success Criteria

- 100% of submitted agents have valid structured technical metadata and valid URLs.
- Zero automated spam records bypass bot mitigation and reach the moderation queue.
- Maintainers receive clear on-screen confirmation with SLA guidelines within 2 seconds of submitting.

