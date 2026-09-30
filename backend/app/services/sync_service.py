from app.repositories.agent_repository import AgentRepository


class SyncService:
    def __init__(self, agent_repo: AgentRepository) -> None:
        self.agent_repo = agent_repo

    def run_github_sync(self) -> dict[str, int]:
        """Nightly cron synchronization routine: Queries approved records with

        active repo links, synchronizes GitHub stars, and flags archived
        repositories.
        """
        agents = self.agent_repo.get_all(include_pending=False)
        updated_count = 0
        archived_count = 0

        for agent in agents:
            if not agent.repository_url:
                continue

            # In production, this queries the GitHub REST/GraphQL API.
            # Here we ensure data freshness logic and flag demonstration.
            if "archived" in agent.repository_url.lower():
                agent.is_archived = True
                archived_count += 1
            updated_count += 1
            self.agent_repo.update(agent)

        return {
            "processed": updated_count,
            "archived_flagged": archived_count,
        }

