from workflow.workflow_to_yaml import WorkflowToYAML
from workflow.workflow_request import (
    WorkflowRequest,
    TriggerRequest,
    JobRequest,
    StepRequest,
)


workflow = WorkflowRequest(
    name="test_workflow",
    runName="test_workflow_run",
    permissions={"actions": "write"},
    trigger=[TriggerRequest(event="test_event", config={})],
    jobs=[
        JobRequest(
            name="Test Job Request",
            steps=[
                StepRequest(
                    name="Test Step",
                    inputs={},
                    id="test_uses",
                    run="test_run",
                )
            ],
        ),
        JobRequest(
            name="Test Job Request 2",
            steps=[
                StepRequest(
                    name="Test Step 2",
                    inputs={},
                    id="test_uses",
                    run="test_run",
                )
            ],
        ),
    ],
    jobEdges=[("Test Job Request", "Test Job Request 2")],
)

print(WorkflowToYAML.to_yaml(workflow))
