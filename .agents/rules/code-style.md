---
trigger: always_on
description: Universal code formatting, linting, naming, and Conventional Commits + Jira key conventions.
---
# Code Style & Commit Conventions

1. **Formatting & Linting**:
   - Python (`backend/`): Ruff (`line-length = 100`, double quotes, sorted imports) + Mypy (`py311`).
   - TypeScript/React (`frontend/`): Prettier + Oxlint (`--deny-warnings`) + strict TypeScript (`tsc -b --noEmit`).
2. **Naming**:
   - Python modules/functions/variables: `snake_case`; Pydantic models & classes: `PascalCase`.
   - React components & TypeScript interfaces: `PascalCase`; hooks/utilities/Redux slices: `camelCase`.
3. **Commits & Jira Traceability**:
   - Follow Conventional Commits (`feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...`).
   - Reference the corresponding Jira issue key (`[SCRUM-XX]`) when implementing or closing a tracked task on the `SCRUM` board.
