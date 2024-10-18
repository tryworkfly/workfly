from typing import OrderedDict

from fastapi import HTTPException

from ..model.step_definition import StepDefinition, StepInput


_steps: OrderedDict[str, StepDefinition] = OrderedDict()

_steps["custom/code"] = StepDefinition(
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

_steps["TejasvOnly/random-rickroll"] = StepDefinition(
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

_steps["super-linter/super-linter"] = StepDefinition(
    name="Super Linter",
    id="super-linter/super-linter",
    version="v7.1.0",
    category="Utility",
    description="Lint your code",
    inputs=[],
)

_steps["actions/checkout"] = StepDefinition(
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
_steps["JamesIves/github-pages-deploy-action"] = StepDefinition(
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


class StepDefinitionClient:
    def __init__(self) -> None:
        pass

    def get_all(self):
        return list(_steps.values())

    def get(self, id: str) -> StepDefinition:
        step = _steps.get(id)
        if step is None:
            raise HTTPException(status_code=404, detail="Step definition not found")
        return step
