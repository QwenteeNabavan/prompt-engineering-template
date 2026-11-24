# Навігатор для захисту проєкту в VS Code (Промпт-інжиніринг)

Відкрийте цей файл у VS Code (або у режимі прев'ю **`Ctrl+Shift+V`**) — кожне посилання нижче за **один клік** (`Ctrl+Click` у редакторі або звичайний клік у прев'ю) відкриває потрібний файл на конкретних рядках.

### 3 швидкі фішки у вашому VS Code під час показу екрана
1. **Миттєвий список усіх ключових блоків у сайдбарі**: натисніть **`Ctrl+Shift+F`** і введіть **`[DEMO-`** — зліва з'явиться пронумерований список головних блоків `[DEMO-01]` … `[DEMO-12]` по всьому проєкту.
2. **Кнопки внизу VS Code (Status Bar)**: завдяки розширенню *Tasks* унизу вікна є дві кольорові кнопки:
   - **`▶ Run AgentHub`** — одночасно запускає FastAPI бекенд (`8001`) та React фронтенд (`5174`).
   - **`✔ Verify All`** — одним кліком при викладачу проганяє всі лінтери, форматери, тайп-чекери, білд і 10 інтеграційних тестів.
3. **Згортання блоків (`#region`)**: у фронтенд-файлах ключові ділянки обгорнуті в `// #region ★ [DEMO-...]`, тому вони підсвічуються у панелі **Outline** (`Ctrl+Shift+O`).

---

## Частина 1. Промпт-інфраструктура агента (Головний фокус курсу)

### 1. Єдине джерело правди: `Agents.MD` та `Claude.md` (`[DEMO-01]`)
- **Куди клікнути**:
  - [Agents.MD](./Agents.MD#L1-L40) — канонічна карта архітектури, команд та інваріантів.
  - [Claude.md](./Claude.md#L1-L22) — мінімальна точка входу, яка через `@[Agents.MD](./Agents.MD)` посилається на `Agents.MD`.
- **Що сказати викладачу**: *«Щоб не спалювати токени вікна сесії на дублювання інструкцій і уникати розсинхрону промптів (Context Drift), `Agents.MD` є єдиним джерелом правди, а `Claude.md` посилається на нього та дає карту `.agents/`».*

### 2. Правила з таргетуванням за шляхами (`rules` + `globs`) (`[DEMO-02]`)
- **Куди клікнути**:
  - [.agents/rules/backend-rules.md](./.agents/rules/backend-rules.md#L1-L21) — `trigger: glob` (`backend/**`)
  - [.agents/rules/frontend-rules.md](./.agents/rules/frontend-rules.md#L1-L21) — `trigger: glob` (`frontend/**`)
  - [.agents/rules/cross-verification.md](./.agents/rules/cross-verification.md#L1-L36) — `trigger: model_decision` (паритет Pydantic ↔ TypeScript ↔ RTK Query)
  - [.agents/rules/safety-and-persistence.md](./.agents/rules/safety-and-persistence.md#L1-L16) — інваріант JSON-масивів та формули ранжування
  - [.agents/rules/code-style.md](./.agents/rules/code-style.md#L1-L16) та [.agents/rules/testing-and-verification.md](./.agents/rules/testing-and-verification.md#L1-L12) — `always_on` базові стандарти
- **Що сказати викладачу**: *«Правила задають декларативні обмеження ("що можна / чого не можна"). Ми додали YAML frontmatter з `globs`, щоб бекенд-правила вантажились у контекст лише під час роботи з `backend/**`, а фронтенд — лише для `frontend/**`, економлячи контекстне вікно».*

### 3. Скіли (`skills`) та Progressive Disclosure (`[DEMO-03]`)
- **Куди клікнути**:
  - [.agents/skills/agenthub-agent-audit/SKILL.md](./.agents/skills/agenthub-agent-audit/SKILL.md#L1-L39) + референс [telemetry-matrix.md](./.agents/skills/agenthub-agent-audit/references/telemetry-matrix.md#L1-L30)
  - [.agents/skills/jira-management/SKILL.md](./.agents/skills/jira-management/SKILL.md#L1-L60) — воркфлоу роботи з Jira Cloud
  - [.agents/skills/fullstack-verification/SKILL.md](./.agents/skills/fullstack-verification/SKILL.md#L1-L34) + скрипт [verify-all.py](./.agents/skills/fullstack-verification/scripts/verify-all.py#L1-L125)
  - [.agents/skills/backend-development/SKILL.md](./.agents/skills/backend-development/SKILL.md#L1-L52) та [.agents/skills/frontend-development/SKILL.md](./.agents/skills/frontend-development/SKILL.md#L1-L39)
- **Що сказати викладачу**: *«На відміну від правил, скіли — це покрокові процедурні рабуки зі скриптами. За замовчуванням агент бачить лише їхній `name` і `description`, а повний текст `SKILL.md` підвантажує тільки коли задача цього вимагає (Progressive Disclosure)».*

### 4. Підключення MCP та Jira OAuth (`[DEMO-04]`)
- **Куди клікнути**:
  - [.agents/mcp_config.json](./.agents/mcp_config.json#L1-L7) — конфігурація віддаленого сервера Atlassian MCP v2 (`https://mcp.atlassian.com/v2/mcp`)
  - [.agents/skills/jira-management/SKILL.md](./.agents/skills/jira-management/SKILL.md#L12-L35) — `cloudId`, проєкт `SCRUM` (`oa-team-paeogdg9.atlassian.net`), типи задач і переходи статусів
- **Що сказати викладачу**: *«MCP (Model Context Protocol) стандартизує доступ агента до зовнішніх Tools/Resources по JSON-RPC. Jira підключена через OAuth 2.0 без збереження секретних API-токенів у репозиторії; через MCP агент створив і оновив епіки/задачі/підзадачі `SCRUM-5..27`».*

### 5. Лінтер, форматер, тайп-чекер та детерміновані Хуки (`[DEMO-05]`, `[DEMO-06]`, `[DEMO-07]`)
- **Куди клікнути**:
  - [.agents/hooks.json](./.agents/hooks.json#L1-L68) — прив'язка життєвих подій `PostToolUse` та `Stop`
  - [.agents/hooks/backend-guard.py](./.agents/hooks/backend-guard.py#L64-L165) — автоформатування `Ruff` після редагування та гейт `Ruff + Mypy + test_api.py` на `Stop`
  - [.agents/hooks/frontend-guard.py](./.agents/hooks/frontend-guard.py#L64-L148) — автоформатування `Prettier` після редагування та гейт `Oxlint + Prettier + tsc` на `Stop`
  - [.agents/hooks/pre-commit](./.agents/hooks/pre-commit#L1-L31) — Git `pre-commit` хук (встановлений у `.git/hooks/pre-commit`)
  - [backend/pyproject.toml](./backend/pyproject.toml#L19-L42) (`[DEMO-07]`) та [frontend/package.json](./frontend/package.json#L6-L16) — налаштування Ruff, Mypy, Oxlint, Prettier, TypeScript
- **Що сказати викладачу**: *«LLM є імовірнісною моделлю і може проігнорувати текстове правило. Хуки роблять перевірку детермінованою: на `PostToolUse` автоматично форматується змінений файл, а на `Stop` при помилці лінтера чи тайп-чекера скрипт повертає `"decision": "continue"` із текстом помилки, змушуючи агента виправити код самостійно».*

---

## Частина 2. Документація та Імплементація Сайту

### 6. Консолідована документація по фічах (`docs/`)
- **Куди клікнути**:
  - [docs/brd.txt](./docs/brd.txt#L1-L55) — базова бізнес-специфікація AgentHub
  - `docs/agents/` — [business-requirements.md](./docs/agents/business-requirements.md), [architecture.md](./docs/agents/architecture.md), [test-cases.md](./docs/agents/test-cases.md)
  - `docs/submissions/` — [business-requirements.md](./docs/submissions/business-requirements.md), [architecture.md](./docs/submissions/architecture.md), [test-cases.md](./docs/submissions/test-cases.md)
  - `docs/comparisons/` — [business-requirements.md](./docs/comparisons/business-requirements.md), [architecture.md](./docs/comparisons/architecture.md), [test-cases.md](./docs/comparisons/test-cases.md)

### 7. Ключові вузли коду (Backend FastAPI + Frontend React 19)
- **`[DEMO-08]` Шарова архітектура FastAPI + DI**: [backend/app/main.py](./backend/app/main.py#L32-L38) та [backend/app/dependencies.py](./backend/app/dependencies.py#L1-L55)
- **`[DEMO-09]` Time-Decay рейтинг та дедуплікація лайків**: [backend/app/services/agent_service.py](./backend/app/services/agent_service.py#L34-L48) і `toggle_upvote` ([рядки 173–212](./backend/app/services/agent_service.py#L173-L212))
- **`[DEMO-10]` Подача агента з XSS-санітизацією та 12h SLA**: [backend/app/services/submission_service.py](./backend/app/services/submission_service.py#L37-L108)
- **`[DEMO-11]` Серверний стан RTK Query з інвалідацією кешу**: [frontend/src/store/api/agentsApi.ts](./frontend/src/store/api/agentsApi.ts#L16-L122)
- **`[DEMO-12]` Каталог із 250ms дебаунсом та `Fuse.js`**: [frontend/src/components/agenthub/AgentHubDashboard.tsx](./frontend/src/components/agenthub/AgentHubDashboard.tsx#L118-L195)
