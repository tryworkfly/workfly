from __future__ import annotations
from typing import TYPE_CHECKING, override

from .step_exporter import StepExporter
from .. import StepDefinition, StepInput

if TYPE_CHECKING:
    from workflow.workflow_to_yaml import StepActionYAML


class RunCodeExporter(StepExporter):
    @staticmethod
    def get_definition() -> StepDefinition:
        return StepDefinition(
            name="Run Code",
            id="custom/code",
            version="v1.0.0",
            category="Utility",
            description="Run custom code",
            inputs=[
                StepInput(
                    name="code",
                    type="string",
                    required=True,
                    description="The code to run",
                ),
            ],
        )

    @override
    def to_github_yaml(self, step) -> StepActionYAML:
        definition = self.get_definition()
        return {
            "name": step["name"],
            "run": step["inputs"]["code"],
        }
