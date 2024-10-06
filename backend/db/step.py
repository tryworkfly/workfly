from dataclasses import dataclass, field
from typing import OrderedDict


@dataclass
class StepInput:
    name: str
    type: str
    required: bool
    description: str


@dataclass
class Step:
    name: str
    id: str
    version: str
    category: str
    description: str
    inputs: list[StepInput]
    required_permissions: dict[str, set[str]] = field(default_factory=dict)


_steps: OrderedDict[str, Step] = OrderedDict()

_steps["custom/code"] = Step(
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

_steps["actions/checkout"] = Step(
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
_steps["JamesIves/github-pages-deploy-action"] = Step(
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


class StepClient:
    def __init__(self) -> None:
        pass

    def get_all(self):
        return list(_steps.values())

    def get(self, id: str) -> Step | None:
        return _steps.get(id)
