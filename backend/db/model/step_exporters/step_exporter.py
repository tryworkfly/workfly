from abc import abstractmethod
from typing import cast

from db.model.step_definition import StepDefinition
from db.model.workflow import Step
from workflow.github_yaml import StepActionYAML


class StepExporter:
    @staticmethod
    @abstractmethod
    def get_definition() -> StepDefinition: ...

    def to_github_yaml(self, step: Step) -> StepActionYAML:
        definition = self.get_definition()
        return cast(
            StepActionYAML,
            {
                "name": step["name"],
                "uses": f"{definition.id}@{definition.version}",
                **({"with": step["inputs"]} if step["inputs"] else {}),
            },
        )
