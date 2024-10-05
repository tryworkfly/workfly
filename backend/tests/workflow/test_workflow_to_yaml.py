from workflow.workflow_to_yaml import WorkflowToYAML
from workflow.workflow_request import (
    JobRequest,
    StepRequest,
    WorkflowRequest,
    TriggerRequest,
)


class TestWorkflowToYAML:
    def test_simple_workflow(self):
        workflow = WorkflowRequest(
            name="test_workflow",
            runName="test_workflow_run",
            permissions={"actions": "write"},
            trigger=[TriggerRequest(event="test_event", config={})],
            jobs=[
                JobRequest(
                    id="1",
                    name="Test Job Request",
                    steps=[
                        StepRequest(
                            name="Test Step",
                            inputs={},
                            uses="test_uses",
                            run="test_run",
                        )
                    ],
                )
            ],
            job_edges=[],
        )

        yaml = WorkflowToYAML.to_yaml(workflow)
        assert yaml == {
            "name": "test_workflow",
            "run-name": "test_workflow_run",
            "permissions": {"actions": "write"},
            "on": {"test_event": {}},
            "jobs": {
                "test-job-request": {
                    "name": "Test Job Request",
                    "runs-on": ["linux"],
                    "needs": [],
                    "steps": [
                        {
                            "name": "Test Step",
                            "uses": "test_uses",
                            "with": {},
                        }
                    ],
                }
            },
        }
