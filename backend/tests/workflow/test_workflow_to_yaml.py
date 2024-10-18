from unittest.mock import patch
import yaml

from tests.mocks.db.step_definition import MockStepDefinitionClient
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
        expected_yaml: str,
        workflow_request: WorkflowRequest,
        permissions: dict[str, str],
        on: dict[str, dict],
        jobs: dict[str, JobYAML],
    ):
        assert yaml.safe_load(expected_yaml) == {
            "name": workflow_request.name,
            "run-name": workflow_request.runName,
            "permissions": permissions,
            "on": on,
            "jobs": jobs,
        }

    @patch("workflow.workflow_to_yaml.StepDefinitionClient", new=MockStepDefinitionClient)
    def test_simple_workflow(self):
        workflow = WorkflowRequest(
            name="test_workflow",
            runName="test_workflow_run",
            trigger=[TriggerRequest(event="test_event", config={})],
            jobs=[
                JobRequest(
                    name="Test Job Request",
                    steps=[
                        StepRequest(
                            name="Test Step",
                            inputs={},
                            id="test_uses",
                        )
                    ],
                )
            ],
            jobEdges=[],
        )

        yaml = WorkflowToYAML.to_yaml(workflow)
        self._assert_yaml_equal(
            yaml,
            workflow,
            permissions={"contents": "read"},
            on={"test_event": {}},
            jobs={
                "test-job-request": {
                    "name": "Test Job Request",
                    "runs-on": ["ubuntu-latest"],
                    "needs": [],
                    "steps": [{"name": "Test Step", "uses": "test_uses@v0.0.1"}],
                }
            },
        )

    @patch("workflow.workflow_to_yaml.StepDefinitionClient", new=MockStepDefinitionClient)
    def test_custom_code_step(self):
        workflow = WorkflowRequest(
            name="test_workflow",
            runName="test_workflow_run",
            trigger=[TriggerRequest(event="test_event", config={})],
            jobs=[
                JobRequest(
                    name="Test Job Request",
                    steps=[
                        StepRequest(
                            name="Test Step",
                            inputs={"code": "echo 'Hello, World!'"},
                            id="custom/code",
                        )
                    ],
                )
            ],
            jobEdges=[],
        )

        yaml = WorkflowToYAML.to_yaml(workflow)
        self._assert_yaml_equal(
            yaml,
            workflow,
            permissions={},
            on={"test_event": {}},
            jobs={
                "test-job-request": {
                    "name": "Test Job Request",
                    "runs-on": ["ubuntu-latest"],
                    "needs": [],
                    "steps": [
                        {
                            "name": "Test Step",
                            "run": "echo 'Hello, World!'",
                        }
                    ],
                }
            },
        )

    @patch("workflow.workflow_to_yaml.StepDefinitionClient", new=MockStepDefinitionClient)
    def test_workflow_with_dependent_jobs(self):
        workflow = WorkflowRequest(
            name="test_workflow",
            runName="test_workflow_run",
            trigger=[TriggerRequest(event="test_event", config={})],
            jobs=[
                JobRequest(
                    name="Test Job Request",
                    steps=[
                        StepRequest(
                            name="Test Step",
                            inputs={},
                            id="test_uses",
                        )
                    ],
                ),
                JobRequest(
                    name="Test Job Request 2",
                    steps=[
                        StepRequest(
                            name="Test Step 2",
                            inputs={},
                            id="test_uses_2",
                        )
                    ],
                ),
            ],
            jobEdges=[("Test Job Request", "Test Job Request 2")],
        )

        yaml = WorkflowToYAML.to_yaml(workflow)
        self._assert_yaml_equal(
            yaml,
            workflow,
            permissions={"contents": "read,write"},
            on={"test_event": {}},
            jobs={
                "test-job-request": {
                    "name": "Test Job Request",
                    "runs-on": ["ubuntu-latest"],
                    "needs": [],
                    "steps": [
                        {
                            "name": "Test Step",
                            "uses": "test_uses@v0.0.1",
                        }
                    ],
                },
                "test-job-request-2": {
                    "name": "Test Job Request 2",
                    "runs-on": ["ubuntu-latest"],
                    "needs": ["test-job-request"],
                    "steps": [
                        {
                            "name": "Test Step 2",
                            "uses": "test_uses_2@v0.0.1",
                        }
                    ],
                },
            },
        )

    @patch("workflow.workflow_to_yaml.StepDefinitionClient", new=MockStepDefinitionClient)
    def test_checkout_then_build(self):
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
                            inputs={},
                            id="actions/checkout",
                        ),
                        StepRequest(
                            name="Install and Build",
                            inputs={"code": "npm ci\nnpm run build"},
                            id="custom/code",
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

        yaml = WorkflowToYAML.to_yaml(workflow)
        self._assert_yaml_equal(
            yaml,
            workflow,
            permissions={"contents": "write"},
            on={"push": {"branches": ["main"]}},
            jobs={
                "build-and-deploy": {
                    "name": "Build and Deploy",
                    "runs-on": ["ubuntu-latest"],
                    "needs": [],
                    "steps": [
                        {
                            "name": "Checkout",
                            "uses": "actions/checkout@v4.2.0",
                        },
                        {
                            "name": "Install and Build",
                            "run": "npm ci\nnpm run build",
                        },
                        {
                            "name": "Deploy",
                            "uses": "JamesIves/github-pages-deploy-action@v4.6.8",
                            "with": {
                                "folder": "dist",
                            },
                        },
                    ],
                }
            },
        )
