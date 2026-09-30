from enum import Enum
from typing import NewType

AgentId = NewType("AgentId", str)
CategoryId = NewType("CategoryId", str)
CollectionId = NewType("CollectionId", str)


class LifecycleState(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class RuntimeEnvironment(str, Enum):
    CLOUD_SAAS = "cloud_saas"
    LOCAL_CLI = "local_cli"
    DOCKER = "docker"
    IDE_EXTENSION = "ide_extension"


class MonetizationTier(str, Enum):
    OPEN_SOURCE = "open_source"
    BYOK = "byok"
    FREEMIUM = "freemium"
    COMMERCIAL = "commercial"


class AutonomyLevel(str, Enum):
    FULLY_AUTONOMOUS = "fully_autonomous"
    SEMI_AUTONOMOUS = "semi_autonomous"
    COPILOT = "copilot"


class TokenOverheadTier(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HEAVY = "heavy"

