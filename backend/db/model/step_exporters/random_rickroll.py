from .step_exporter import StepExporter
from .. import StepDefinition, StepInput


class RandomRickrollExporter(StepExporter):
    @staticmethod
    def get_definition() -> StepDefinition:
        return StepDefinition(
            name="Random Rickroll",
            id="TejasvOnly/random-rickroll",
            version="v1.0.0",
            category="Utility",
            description="Rickroll someone",
            inputs=[
                StepInput(
                    name="percentage",
                    type="string",
                    required=True,
                    description="The percentage of people to rickroll (0-100)",
                )
            ],
        )
