from .step_exporter import StepExporter
from .. import StepDefinition, StepInput


class GithubPagesDeployActionExporter(StepExporter):
    @staticmethod
    def get_definition() -> StepDefinition:
        return StepDefinition(
            name="Deploy to GitHub Pages",
            id="JamesIves/github-pages-deploy-action",
            version="v4.6.8",
            category="Deployment",
            description="Deploy your site to GitHub Pages",
            inputs=[
                StepInput(
                    name="folder",
                    type="string",
                    required=True,
                    description="The folder to deploy",
                )
            ],
            required_permissions={"contents": {"write"}},
        )
