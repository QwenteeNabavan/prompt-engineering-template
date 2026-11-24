---
name: jira-management
description: >-
  Use this skill when interacting with Jira Cloud for the AgentHub project (viewing, searching with JQL,
  creating, updating, commenting, transitioning, or archiving tasks/epics/subtasks via the Atlassian MCP server).
---

# AgentHub Jira Management Skill

This skill provides a standardized workflow and pre-configured project metadata for managing tasks in **Jira Cloud** using the **Atlassian MCP v2** server (`https://mcp.atlassian.com/v2/mcp`).

## 1. Project & Workspace Constants

Use these constants directly in `atlassian` MCP tool calls to avoid redundant discovery calls:

- **MCP Endpoint (v2)**: `https://mcp.atlassian.com/v2/mcp`
- **Atlassian Site URL**: `https://oa-team-paeogdg9.atlassian.net`
- **Cloud ID (`cloudId`)**: `3f478345-8b4e-453f-9ff3-adb50bb2dbd3`
- **Project Key (`projectKey`)**: `SCRUM` (Project Name: **My Team**, ID: `10000`)
- **Default Reporter / Lead**: Іван (`accountId`: `712020:0602e599-24ac-464d-a284-4a6d3843ea14`)

### Issue Types (`issueTypeName`)
| Issue Type | ID | Hierarchy Level | Usage |
| :--- | :--- | :--- | :--- |
| `Epic` | `10001` | `1` | High-level feature initiatives |
| `Task` | `10003` | `0` | Standard engineering tasks, backend/frontend work |
| `Subtask` | `10002` | `-1` | Granular breakdown linked via `parent` key (e.g., `SCRUM-5`) |

### Workflow Transitions (`transition.id`)
| Target Status | Transition ID | Status ID | Category |
| :--- | :--- | :--- | :--- |
| `To Do` | `"11"` | `10000` | New / Backlog |
| `In Progress` | `"21"` | `10001` | Active work |
| `Done` | `"31"` | `10002` | Completed / Archived |

---

## 2. Atlassian MCP v2 Architecture Notes

Atlassian MCP v2 supports two operating modes depending on how the server is connected:
1. **Dynamic Discovery Mode (Default v2: `https://mcp.atlassian.com/v2/mcp`)**:
   - Exposes core entry tools (`atlassianUserInfo`, `getAccessibleAtlassianResources`, `discover`, `execute`) to reduce upfront context window usage.
   - Use `discover` to search for available Jira/Confluence/Teamwork Graph tools and `execute` to invoke them with the payloads below, or call the tools directly if already discovered/exposed.
2. **Flattened Tool Mode (`https://mcp.atlassian.com/v2/mcp?tools=all`)**:
   - Exposes all tools directly (`searchJiraIssuesUsingJql`, `createJiraIssue`, `editJiraIssue`, `transitionJiraIssue`, etc.) at connection time.

---

## 3. Core Workflows

### A. Listing & Searching Issues (`searchJiraIssuesUsingJql`)
Always filter out archived/template tasks (`labels != obsolete` or `status != Done`) when reviewing active work:
```json
{
  "cloudId": "3f478345-8b4e-453f-9ff3-adb50bb2dbd3",
  "jql": "project = SCRUM AND (labels is EMPTY OR labels != obsolete) ORDER BY status ASC, created DESC",
  "maxResults": 50
}
```

### B. Creating Issues (`createJiraIssue`)
Write clear Ukrainian summaries and technical descriptions aligned with AgentHub's architecture (`backend/` FastAPI + `frontend/` React/TypeScript):
```json
{
  "cloudId": "3f478345-8b4e-453f-9ff3-adb50bb2dbd3",
  "projectKey": "SCRUM",
  "issueTypeName": "Task",
  "summary": "Коротка та змістовна назва задачі",
  "description": "Детальний технічний опис вимог, компонентів та критеріїв приймання.",
  "additional_fields": {
    "priority": { "name": "Medium" },
    "labels": ["agenthub"]
  }
}
```

### C. Updating & Transitioning Issues (`editJiraIssue` & `transitionJiraIssue`)
- To change status, call `transitionJiraIssue` with `transition: { "id": "21" }` (`In Progress`) or `{ "id": "31" }` (`Done`).
- To update fields (summary, description, priority, labels), call `editJiraIssue` with `fields`.

### D. Deleting or Archiving Unneeded Tasks
- **Atlassian MCP v2** introduces the `delete:jira:agent-interface` OAuth scope. If a deletion tool is available via `discover` and authorized by the user's OAuth grant, use it for permanent deletion when requested.
- **Soft-Archive Fallback** (if hard-delete is restricted or soft-archiving is preferred):
  1. Update the issue via `editJiraIssue` to add `"labels": ["obsolete", "deleted"]` and prefix the summary with `[Видалено]`.
  2. Transition the issue via `transitionJiraIssue` to `Done` (`transition: { "id": "31" }`) so it is removed from active `To Do` / `In Progress` board columns.

