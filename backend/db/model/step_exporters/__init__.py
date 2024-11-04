from .step_exporter import StepExporter
from .checkout import CheckoutExporter
from .github_pages_deploy_action import GithubPagesDeployActionExporter
from .random_rickroll import RandomRickrollExporter
from .run_code import RunCodeExporter
from .super_linter import SuperLinterExporter

STEP_EXPORTERS: list[type[StepExporter]] = [
    CheckoutExporter,
    GithubPagesDeployActionExporter,
    RandomRickrollExporter,
    RunCodeExporter,
    SuperLinterExporter,
]

STEP_EXPORTERS_MAP = {
    exporter.get_definition().id: exporter for exporter in STEP_EXPORTERS
}
