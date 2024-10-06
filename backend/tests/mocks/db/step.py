from typing import OrderedDict

from db.step import Step, StepInput

_steps: OrderedDict[str, Step] = OrderedDict()

_steps["test_uses"] = Step(
    name="Test Step",
    id="test_uses",
    version="v0.0.1",
    category="Test",
    description="Test Step",
    inputs=[],
    required_permissions={"contents": {"read"}},
)

_steps["test_uses_2"] = Step(
    name="Test Step 2",
    id="test_uses_2",
    version="v0.0.1",
    category="Test",
    description="Test Step 2",
    inputs=[],
    required_permissions={"contents": {"write"}},
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


class MockStepClient:
    def __init__(self) -> None:
        pass

    def get_all(self):
        return _steps.values()

    def get(self, id: str):
        return _steps.get(id)
