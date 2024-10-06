import yaml
from workflow.workflow_to_yaml import JobYAML, WorkflowToYAML
from workflow.workflow_request import (
    JobRequest,
    StepRequest,
    WorkflowRequest,
    TriggerRequest,
)


class TestWorkflowToYAML:
    def _assert_yaml_equal(
        self,
        expected_yaml: dict,
        workflow_request: WorkflowRequest,
        on: dict[str, dict],
        jobs: dict[str, JobYAML],
    ):
        assert yaml.safe_load(expected_yaml) == {
            "name": workflow_request.name,
            "run-name": workflow_request.runName,
            "permissions": workflow_request.permissions,
            "on": on,
            "jobs": jobs,
        }

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
        self._assert_yaml_equal(
            yaml,
            workflow,
            on={"test_event": {}},
            jobs={
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
        )

    def test_workflow_with_dependent_jobs(self):
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
                            uses="test_uses",
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
                            uses="test_uses",
                            run="test_run",
                        )
                    ],
                ),
            ],
            job_edges=[("Test Job Request", "Test Job Request 2")],
        )

        yaml = WorkflowToYAML.to_yaml(workflow)
        self._assert_yaml_equal(
            yaml,
            workflow,
            on={"test_event": {}},
            jobs={
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
                },
                "test-job-request-2": {
                    "name": "Test Job Request 2",
                    "runs-on": ["linux"],
                    "needs": ["test-job-request"],
                    "steps": [
                        {
                            "name": "Test Step 2",
                            "uses": "test_uses",
                            "with": {},
                        }
                    ],
                },
            },
        )
