# Claude Code Entry Point — AgentHub

@[Agents.MD](./Agents.MD)

> **Single Source of Truth**: Read [`Agents.MD`](./Agents.MD) for the full project architecture, commands, and non-negotiable invariants. Do not duplicate rules here to preserve session context budget.

## Quick Customization Map (`.agents/`)

- **Scoped Rules (`.agents/rules/`)** — Loaded selectively by file path (`globs`) or task context:
  - [`backend-rules.md`](./.agents/rules/backend-rules.md) (`backend/**`)
  - [`frontend-rules.md`](./.agents/rules/frontend-rules.md) (`frontend/**`)
  - [`safety-and-persistence.md`](./.agents/rules/safety-and-persistence.md) (`backend/data/**`, repositories/services)
  - [`cross-verification.md`](./.agents/rules/cross-verification.md) (API ↔ RTK Query parity)
  - [`code-style.md`](./.agents/rules/code-style.md) & [`testing-and-verification.md`](./.agents/rules/testing-and-verification.md)
- **Progressive Skills (`.agents/skills/`)** — Loaded on demand for specialized multi-step workflows:
  - `agenthub-agent-audit` | `backend-development` | `frontend-development` | `fullstack-verification` | `jira-management`
- **Deterministic Hooks ([`.agents/hooks.json`](./.agents/hooks.json) & `.git/hooks/pre-commit`)** — Auto-formats on `PostToolUse` (Ruff / Prettier) and gates `Stop` & `git commit` on Ruff, Mypy, Oxlint, Prettier, `tsc`, JSON array integrity, and API tests.
- **MCP Integration ([`.agents/mcp_config.json`](./.agents/mcp_config.json))** — Atlassian Jira Cloud (`SCRUM` board) authenticated via OAuth 2.0.
- **Instructor Demo Map**: Open [`DEMO_GUIDE.md`](./DEMO_GUIDE.md) or search `[DEMO-` (`Ctrl+Shift+F`) in VS Code to jump directly to any architectural checkpoint.
