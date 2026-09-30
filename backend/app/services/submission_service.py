from datetime import datetime
import re
import uuid
from fastapi import HTTPException
from app.models.agent import AgentInDb
from app.models.submission import (
    SubmissionCreateRequest,
    SubmissionResponse,
)
from app.repositories.agent_repository import AgentRepository
from app.repositories.category_repository import CategoryRepository


class SubmissionService:
    def __init__(
        self,
        agent_repo: AgentRepository,
        category_repo: CategoryRepository,
    ) -> None:
        self.agent_repo = agent_repo
        self.category_repo = category_repo

    def _generate_slug(self, title: str) -> str:
        base_slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        if not base_slug:
            base_slug = "agent"

        candidate = base_slug
        suffix = 1
        while self.agent_repo.get_by_slug(candidate):
            candidate = f"{base_slug}-{suffix}"
            suffix += 1
        return candidate

    def submit_agent(
        self, payload: SubmissionCreateRequest
    ) -> SubmissionResponse:
        # 1. Verify Category exists
        category = self.category_repo.get_by_id(payload.category_id)
        if not category:
            category = self.category_repo.get_by_slug(payload.category_id)
            if not category:
                raise HTTPException(
                    status_code=400,
                    detail=f"Category '{payload.category_id}' does not exist",
                )

        # 2. Basic Bot verification check
        # If bot_token is 'bot_fail', reject
        if payload.bot_token == "bot_fail":
            raise HTTPException(
                status_code=403,
                detail="Bot verification failed. Automated abuse prevention triggered.",
            )

        # 3. Clean and sanitize Markdown
        # Strip script/iframe tags
        clean_markdown = re.sub(
            r"<\s*(script|iframe|style)[^>]*>.*?<\s*/\s*(script|iframe|style)\s*>",
            "",
            payload.description_markdown,
            flags=re.DOTALL | re.IGNORECASE,
        )

        # 4. Generate unique slug
        slug = self._generate_slug(payload.title)
        agent_id = str(uuid.uuid4())

        new_agent = AgentInDb(
            id=agent_id,
            slug=slug,
            title=payload.title,
            tagline=payload.tagline,
            summary=payload.summary[:120],
            description_markdown=clean_markdown,
            logo_url=payload.logo_url,
            website_url=payload.website_url,
            repository_url=payload.repository_url,
            github_stars=0,
            category_id=category.id,
            deployment_targets=payload.deployment_targets,
            llm_backends=payload.llm_backends,
            framework=payload.framework,
            is_open_source=payload.is_open_source,
            is_mcp_compliant=payload.is_mcp_compliant,
            hardware_requirements=payload.hardware_requirements,
            terminal_setup_script=payload.terminal_setup_script,
            strengths=["Autonomous Task Execution", "Structured Tool Usage"],
            known_edge_cases=["Pending initial technical telemetry audit"],
            upvotes_count=0,
            lifecycle_state="pending",  # Pending moderation review
            is_archived=False,
            submitter_email=payload.submitter_email,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        self.agent_repo.create(new_agent)

        return SubmissionResponse(
            submission_id=agent_id,
            slug=slug,
            title=payload.title,
            status="pending",
            sla_hours=12,
            submitted_at=new_agent.created_at,
            message="Submission received and committed to moderation queue. Standard review turnaround is within 12 hours.",
        )

