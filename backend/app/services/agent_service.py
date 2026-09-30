from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException
from app.models.agent import (
    AgentInDb,
    AgentListItemResponse,
    AgentDetailResponse,
)
from app.models.upvote import UpvoteResponse
from app.repositories.agent_repository import AgentRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.upvote_repository import UpvoteRepository


def _to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class AgentService:
    def __init__(
        self,
        agent_repo: AgentRepository,
        category_repo: CategoryRepository,
        upvote_repo: UpvoteRepository,
    ) -> None:
        self.agent_repo = agent_repo
        self.category_repo = category_repo
        self.upvote_repo = upvote_repo

    def calculate_ranking_score(self, agent: AgentInDb) -> float:
        """Dynamic exponential time-decay ranking algorithm:

        Score = (Upvotes_7d + 1) / ((Age_hours + 2) ^ 1.5)
        """
        recent_upvotes = self.upvote_repo.get_recent_upvotes_count(
            agent.id, hours=168
        )
        # fallback to agent.upvotes_count if no vote history in repository
        effective_upvotes = max(recent_upvotes, agent.upvotes_count)
        now = datetime.now(timezone.utc)
        age_hours = max(0.0, (now - _to_utc(agent.created_at)).total_seconds() / 3600.0)
        numerator = effective_upvotes + 1.0
        denominator = (age_hours + 2.0) ** 1.5
        return round(numerator / denominator, 5)

    def list_agents(
        self,
        q: Optional[str] = None,
        category: Optional[str] = None,
        runtime: Optional[str] = None,
        monetization: Optional[str] = None,
        sort_by: str = "trending",
    ) -> list[AgentListItemResponse]:
        agents = self.agent_repo.get_all(include_pending=False)

        # 1. Filter by Category slug if provided
        if category and category.lower() != "all":
            cat = self.category_repo.get_by_slug(category)
            if cat:
                agents = [a for a in agents if a.category_id == cat.id]

        # 2. Filter by Runtime Environment
        if runtime and runtime.lower() != "all":
            agents = [a for a in agents if runtime in a.deployment_targets]

        # 3. Filter by Monetization / Licensing
        if monetization and monetization.lower() != "all":
            if monetization == "open_source":
                agents = [a for a in agents if a.is_open_source]
            elif monetization == "commercial":
                agents = [a for a in agents if not a.is_open_source]

        # 4. Text Search (Fuzzy/Substring on title, tagline, framework, llm_backends)
        if q:
            query = q.strip().lower()
            agents = [
                a
                for a in agents
                if query in a.title.lower()
                or query in a.tagline.lower()
                or (a.framework and query in a.framework.lower())
                or any(query in b.lower() for b in a.llm_backends)
            ]

        # 5. Compute ranking scores
        items_with_scores: list[tuple[AgentInDb, float]] = [
            (a, self.calculate_ranking_score(a)) for a in agents
        ]

        # 6. Sorting
        if sort_by == "top":
            items_with_scores.sort(
                key=lambda x: (x[0].upvotes_count, x[1]), reverse=True
            )
        elif sort_by == "stars":
            items_with_scores.sort(
                key=lambda x: (x[0].github_stars, x[1]), reverse=True
            )
        elif sort_by == "newest":
            items_with_scores.sort(key=lambda x: _to_utc(x[0].created_at), reverse=True)
        else:  # default: trending time-decay
            items_with_scores.sort(key=lambda x: x[1], reverse=True)

        return [
            AgentListItemResponse(
                id=a.id,
                slug=a.slug,
                title=a.title,
                tagline=a.tagline,
                summary=a.summary,
                logo_url=a.logo_url,
                website_url=a.website_url,
                repository_url=a.repository_url,
                github_stars=a.github_stars,
                category_id=a.category_id,
                deployment_targets=a.deployment_targets,
                llm_backends=a.llm_backends,
                framework=a.framework,
                is_open_source=a.is_open_source,
                is_mcp_compliant=a.is_mcp_compliant,
                upvotes_count=a.upvotes_count,
                lifecycle_state=a.lifecycle_state,
                is_archived=a.is_archived,
                created_at=a.created_at,
                ranking_score=score,
            )
            for a, score in items_with_scores
        ]

    def get_agent_by_slug(self, slug: str) -> AgentDetailResponse:
        agent = self.agent_repo.get_by_slug(slug)
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent '{slug}' not found")

        cat = self.category_repo.get_by_id(agent.category_id)
        category_title = cat.title if cat else "General"
        score = self.calculate_ranking_score(agent)

        return AgentDetailResponse(
            id=agent.id,
            slug=agent.slug,
            title=agent.title,
            tagline=agent.tagline,
            summary=agent.summary,
            description_markdown=agent.description_markdown,
            logo_url=agent.logo_url,
            website_url=agent.website_url,
            repository_url=agent.repository_url,
            github_stars=agent.github_stars,
            category_id=agent.category_id,
            category_title=category_title,
            deployment_targets=agent.deployment_targets,
            llm_backends=agent.llm_backends,
            framework=agent.framework,
            is_open_source=agent.is_open_source,
            is_mcp_compliant=agent.is_mcp_compliant,
            hardware_requirements=agent.hardware_requirements,
            terminal_setup_script=agent.terminal_setup_script,
            strengths=agent.strengths,
            known_edge_cases=agent.known_edge_cases,
            upvotes_count=agent.upvotes_count,
            lifecycle_state=agent.lifecycle_state,
            is_archived=agent.is_archived,
            created_at=agent.created_at,
            ranking_score=score,
            autonomy_level=agent.autonomy_level,
            has_vector_rag=agent.has_vector_rag,
            memory_backend=agent.memory_backend,
            multimodal_capabilities=agent.multimodal_capabilities,
            token_overhead_tier=agent.token_overhead_tier,
            maintenance_cadence=agent.maintenance_cadence,
        )

    def toggle_upvote(
        self,
        agent_id: str,
        user_id: Optional[str] = None,
        fingerprint: Optional[str] = None,
    ) -> UpvoteResponse:
        agent = self.agent_repo.get_by_id(agent_id)
        if not agent:
            raise HTTPException(
                status_code=404, detail=f"Agent ID '{agent_id}' not found"
            )

        has_voted = self.upvote_repo.has_upvoted(
            agent_id, user_id=user_id, fingerprint=fingerprint
        )
        if has_voted:
            # Revoke upvote
            self.upvote_repo.remove_upvote(
                agent_id, user_id=user_id, fingerprint=fingerprint
            )
            agent.upvotes_count = max(0, agent.upvotes_count - 1)
            self.agent_repo.update(agent)
            return UpvoteResponse(
                success=True,
                agent_id=agent.id,
                upvotes_count=agent.upvotes_count,
                has_upvoted=False,
                message="Upvote removed",
            )
        else:
            # Cast upvote
            added = self.upvote_repo.add_upvote(
                agent_id, user_id=user_id, fingerprint=fingerprint
            )
            if not added:
                raise HTTPException(
                    status_code=409,
                    detail="Duplicate upvote constraint violated",
                )
            agent.upvotes_count += 1
            self.agent_repo.update(agent)
            return UpvoteResponse(
                success=True,
                agent_id=agent.id,
                upvotes_count=agent.upvotes_count,
                has_upvoted=True,
                message="Upvote recorded successfully",
            )

    def get_alternatives(
        self, slug: str, limit: int = 4
    ) -> list[AgentListItemResponse]:
        agent = self.agent_repo.get_by_slug(slug)
        if not agent:
            return []

        all_in_category = [
            a
            for a in self.agent_repo.get_all(include_pending=False)
            if a.category_id == agent.category_id and a.id != agent.id
        ]
        all_in_category.sort(key=lambda a: a.upvotes_count, reverse=True)
        top_alternatives = all_in_category[:limit]

        return [
            AgentListItemResponse(
                id=a.id,
                slug=a.slug,
                title=a.title,
                tagline=a.tagline,
                summary=a.summary,
                logo_url=a.logo_url,
                website_url=a.website_url,
                repository_url=a.repository_url,
                github_stars=a.github_stars,
                category_id=a.category_id,
                deployment_targets=a.deployment_targets,
                llm_backends=a.llm_backends,
                framework=a.framework,
                is_open_source=a.is_open_source,
                is_mcp_compliant=a.is_mcp_compliant,
                upvotes_count=a.upvotes_count,
                lifecycle_state=a.lifecycle_state,
                is_archived=a.is_archived,
                created_at=a.created_at,
                ranking_score=self.calculate_ranking_score(a),
            )
            for a in top_alternatives
        ]

