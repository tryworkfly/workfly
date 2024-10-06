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

print(WorkflowToYAML.to_yaml(workflow))
