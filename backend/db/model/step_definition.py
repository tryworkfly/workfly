from dataclasses import dataclass, field


@dataclass
class StepInput:
    name: str
    type: str
    required: bool
    description: str


@dataclass
class StepDefinition:
    name: str
    id: str
    version: str
    category: str
    description: str
    inputs: list[StepInput]
    required_permissions: dict[str, set[str]] = field(default_factory=dict)