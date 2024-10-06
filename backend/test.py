from workflow.workflow_to_yaml import WorkflowToYAML
from workflow.workflow_request import (
    WorkflowRequest,
    TriggerRequest,
    JobRequest,
    StepRequest,
)


workflow = WorkflowRequest(
    name="Deploy to GitHub Pages",
    runName="Deploy to GitHub Pages",
    trigger=[TriggerRequest(event="push", config={"branches": ["main"]})],
    jobs=[
        JobRequest(
            name="Build and Deploy",
            steps=[
                StepRequest(
                    name="Checkout",
                    inputs=None,
                    id="actions/checkout",
                ),
                StepRequest(
                    name="Install and Build",
                    inputs=None,
                    id=None,
                    run="npm ci\nnpm run build",
                ),
                StepRequest(
                    name="Deploy",
                    inputs={
                        "folder": "dist",
                    },
                    id="JamesIves/github-pages-deploy-action",
                ),
            ],
        )
    ],
    jobEdges=[],
)

workflow = WorkflowRequest(
    name="Run Tests",
    runName="Run Tests",
    trigger=[TriggerRequest(event="pull_request", config={"branches": ["main"]})],
    jobs=[
        JobRequest(
            name="Run Tests",
            steps=[
                StepRequest(
                    name="Checkout",
                    inputs=None,
                    id="actions/checkout",
                ),
                StepRequest(
                    name="Run Tests",
                    inputs=None,
                    id=None,
                    run="npm run test",
                ),
            ],
        )
    ],
    jobEdges=[],
)

# print(workflow.model_dump_json(indent=4))
print(WorkflowToYAML.to_yaml(workflow))
