from fastapi import HTTPException
from app.models.agent import AgentListItemResponse
from app.models.collection import (
    CollectionResponse,
    AgentComparisonItem,
    ComparisonMatrixResponse,
)
from app.repositories.agent_repository import AgentRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.collection_repository import CollectionRepository


class CollectionService:
    def __init__(
        self,
        collection_repo: CollectionRepository,
        agent_repo: AgentRepository,
        category_repo: CategoryRepository,
    ) -> None:
        self.collection_repo = collection_repo
        self.agent_repo = agent_repo
        self.category_repo = category_repo

    def list_collections(self) -> list[CollectionResponse]:
        collections = self.collection_repo.get_all()
        result: list[CollectionResponse] = []
        for col in collections:
            featured_agents: list[AgentListItemResponse] = []
            for agent_id in col.featured_agent_ids:
                agent = self.agent_repo.get_by_id(agent_id)
                if agent and agent.lifecycle_state == "approved":
                    featured_agents.append(
                        AgentListItemResponse(
                            id=agent.id,
                            slug=agent.slug,
                            title=agent.title,
                            tagline=agent.tagline,
                            summary=agent.summary,
                            logo_url=agent.logo_url,
                            website_url=agent.website_url,
                            repository_url=agent.repository_url,
                            github_stars=agent.github_stars,
                            category_id=agent.category_id,
                            deployment_targets=agent.deployment_targets,
                            llm_backends=agent.llm_backends,
                            framework=agent.framework,
                            is_open_source=agent.is_open_source,
                            is_mcp_compliant=agent.is_mcp_compliant,
                            upvotes_count=agent.upvotes_count,
                            lifecycle_state=agent.lifecycle_state,
                            is_archived=agent.is_archived,
                            created_at=agent.created_at,
                            ranking_score=0.0,
                        )
                    )
            result.append(
                CollectionResponse(
                    id=col.id,
                    slug=col.slug,
                    title=col.title,
                    editorial_summary=col.editorial_summary,
                    content_markdown=col.content_markdown,
                    featured_agents=featured_agents,
                    display_order=col.display_order,
                )
            )
        return result

    def get_collection_by_slug(self, slug: str) -> CollectionResponse:
        col = self.collection_repo.get_by_slug(slug)
        if not col:
            raise HTTPException(
                status_code=404, detail=f"Collection '{slug}' not found"
            )

        featured_agents: list[AgentListItemResponse] = []
        for agent_id in col.featured_agent_ids:
            agent = self.agent_repo.get_by_id(agent_id)
            if agent and agent.lifecycle_state == "approved":
                featured_agents.append(
                    AgentListItemResponse(
                        id=agent.id,
                        slug=agent.slug,
                        title=agent.title,
                        tagline=agent.tagline,
                        summary=agent.summary,
                        logo_url=agent.logo_url,
                        website_url=agent.website_url,
                        repository_url=agent.repository_url,
                        github_stars=agent.github_stars,
                        category_id=agent.category_id,
                        deployment_targets=agent.deployment_targets,
                        llm_backends=agent.llm_backends,
                        framework=agent.framework,
                        is_open_source=agent.is_open_source,
                        is_mcp_compliant=agent.is_mcp_compliant,
                        upvotes_count=agent.upvotes_count,
                        lifecycle_state=agent.lifecycle_state,
                        is_archived=agent.is_archived,
                        created_at=agent.created_at,
                        ranking_score=0.0,
                    )
                )

        return CollectionResponse(
            id=col.id,
            slug=col.slug,
            title=col.title,
            editorial_summary=col.editorial_summary,
            content_markdown=col.content_markdown,
            featured_agents=featured_agents,
            display_order=col.display_order,
        )

    def compare_agents(self, slugs: list[str]) -> ComparisonMatrixResponse:
        if len(slugs) < 2:
            raise HTTPException(
                status_code=400,
                detail="At least 2 agents must be provided for comparison.",
            )
        if len(slugs) > 3:
            raise HTTPException(
                status_code=400,
                detail="A maximum of 3 agents can be compared simultaneously.",
            )

        items: list[AgentComparisonItem] = []
        category_ids: set[str] = set()

        for slug in slugs:
            agent = self.agent_repo.get_by_slug(slug)
            if not agent:
                agent = self.agent_repo.get_by_id(slug)
            if not agent:
                raise HTTPException(
                    status_code=404, detail=f"Agent '{slug}' not found"
                )

            category = self.category_repo.get_by_id(agent.category_id)
            cat_title = category.title if category else "General"
            category_ids.add(agent.category_id)

            items.append(
                AgentComparisonItem(
                    id=agent.id,
                    slug=agent.slug,
                    title=agent.title,
                    tagline=agent.tagline,
                    logo_url=agent.logo_url,
                    category_title=cat_title,
                    framework=agent.framework,
                    is_open_source=agent.is_open_source,
                    is_mcp_compliant=agent.is_mcp_compliant,
                    github_stars=agent.github_stars,
                    upvotes_count=agent.upvotes_count,
                    autonomy_level=agent.autonomy_level,
                    has_vector_rag=agent.has_vector_rag,
                    memory_backend=agent.memory_backend,
                    multimodal_capabilities=agent.multimodal_capabilities,
                    token_overhead_tier=agent.token_overhead_tier,
                    maintenance_cadence=agent.maintenance_cadence,
                    strengths=agent.strengths,
                    known_edge_cases=agent.known_edge_cases,
                )
            )

        comparison_params = [
            "Degree of Execution Autonomy",
            "Vector Memory & RAG Integration",
            "Multimodal Asset Handling",
            "Estimated Token Consumption Overhead",
            "Community Maintenance Cadence",
        ]

        return ComparisonMatrixResponse(
            agents=items,
            comparison_parameters=comparison_params,
            is_cross_category=(len(category_ids) > 1),
        )

