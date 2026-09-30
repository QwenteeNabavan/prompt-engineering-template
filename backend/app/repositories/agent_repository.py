from datetime import datetime
from pathlib import Path
from typing import Optional
from app.models.agent import AgentInDb
from app.utils.json_store import read_list_file, write_list_file


class AgentRepository:
    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path

    def get_all(self, include_pending: bool = False) -> list[AgentInDb]:
        agents = read_list_file(self.file_path, AgentInDb)
        if not include_pending:
            return [a for a in agents if a.lifecycle_state == "approved"]
        return agents

    def get_by_id(self, agent_id: str) -> Optional[AgentInDb]:
        agents = read_list_file(self.file_path, AgentInDb)
        for a in agents:
            if a.id == agent_id:
                return a
        return None

    def get_by_slug(self, slug: str) -> Optional[AgentInDb]:
        agents = read_list_file(self.file_path, AgentInDb)
        for a in agents:
            if a.slug == slug:
                return a
        return None

    def create(self, agent: AgentInDb) -> AgentInDb:
        agents = read_list_file(self.file_path, AgentInDb)
        agents.append(agent)
        write_list_file(self.file_path, agents)
        return agent

    def update(self, agent: AgentInDb) -> AgentInDb:
        agents = read_list_file(self.file_path, AgentInDb)
        agent.updated_at = datetime.utcnow()
        updated = False
        for idx, existing in enumerate(agents):
            if existing.id == agent.id:
                agents[idx] = agent
                updated = True
                break
        if updated:
            write_list_file(self.file_path, agents)
        return agent

    def delete(self, agent_id: str) -> bool:
        agents = read_list_file(self.file_path, AgentInDb)
        initial_len = len(agents)
        agents = [a for a in agents if a.id != agent_id]
        if len(agents) < initial_len:
            write_list_file(self.file_path, agents)
            return True
        return False

