from .step_exporter import StepExporter
from db.model import StepDefinition


class SuperLinterExporter(StepExporter):
    @staticmethod
    def get_definition() -> StepDefinition:
        return StepDefinition(
            name="Super Linter",
            id="super-linter/super-linter",
            version="v7.1.0",
            category="Utility",
            description="Lint your code",
            inputs=[],
        )
