from .step_exporter import StepExporter
from .. import StepDefinition, StepInput


class CheckoutExporter(StepExporter):
    @staticmethod
    def get_definition() -> StepDefinition:
        return StepDefinition(
            name="Checkout",
            id="actions/checkout",
            version="v4.2.0",
            category="Utility",
            description="Checkout a repository",
            inputs=[
                StepInput(
                    name="ref",
                    type="string",
                    required=False,
                    description="The branch, tag, or SHA to checkout",
                ),
                StepInput(
                    name="repository",
                    type="string",
                    required=False,
                    description="The repository to checkout",
                ),
            ],
        )
