from unittest.mock import patch
import yaml

from db.model import Job, Step, Trigger, Workflow
from tests.mocks.db.step_definition import MockStepDefinitionClient
from workflow.workflow_to_yaml import JobYAML, WorkflowToYAML


class TestWorkflowToYAML:
    def _assert_yaml_equal(
        self,
        expected_yaml: str,
        workflow_request: Workflow,
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

    @patch(
        "workflow.workflow_to_yaml.StepDefinitionClient", new=MockStepDefinitionClient
    )
    def test_simple_workflow(self):
        workflow = Workflow(
            name="test_workflow",
            runName="test_workflow_run",
            trigger=[Trigger(event="test_event", config={})],
            jobs=[
                Job(
                    name="Test Job Request",
                    steps=[
                        Step(
                            name="Test Step",
                            inputs={},
                            step_id="test_uses",
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

    @patch(
        "workflow.workflow_to_yaml.StepDefinitionClient", new=MockStepDefinitionClient
    )
    def test_custom_code_step(self):
        workflow = Workflow(
            name="test_workflow",
            runName="test_workflow_run",
            trigger=[Trigger(event="test_event", config={})],
            jobs=[
                Job(
                    name="Test Job Request",
                    steps=[
                        Step(
                            name="Test Step",
                            inputs={"code": "echo 'Hello, World!'"},
                            step_id="custom/code",
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

    @patch(
        "workflow.workflow_to_yaml.StepDefinitionClient", new=MockStepDefinitionClient
    )
    def test_workflow_with_dependent_jobs(self):
        workflow = Workflow(
            name="test_workflow",
            runName="test_workflow_run",
            trigger=[Trigger(event="test_event", config={})],
            jobs=[
                Job(
                    name="Test Job Request",
                    steps=[
                        Step(
                            name="Test Step",
                            inputs={},
                            step_id="test_uses",
                        )
                    ],
                ),
                Job(
                    name="Test Job Request 2",
                    steps=[
                        Step(
                            name="Test Step 2",
                            inputs={},
                            step_id="test_uses_2",
                        )
                    ],
                ),
            ],
            job_edges=[["Test Job Request", "Test Job Request 2"]],
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

    @patch(
        "workflow.workflow_to_yaml.StepDefinitionClient", new=MockStepDefinitionClient
    )
    def test_checkout_then_build(self):
        workflow = Workflow(
            name="Deploy to GitHub Pages",
            runName="Deploy to GitHub Pages",
            trigger=[Trigger(event="push", config={"branches": ["main"]})],
            jobs=[
                Job(
                    name="Build and Deploy",
                    steps=[
                        Step(
                            name="Checkout",
                            inputs={},
                            step_id="actions/checkout",
                        ),
                        Step(
                            name="Install and Build",
                            inputs={"code": "npm ci\nnpm run build"},
                            step_id="custom/code",
                        ),
                        Step(
                            name="Deploy",
                            inputs={
                                "folder": "dist",
                            },
                            step_id="JamesIves/github-pages-deploy-action",
                        ),
                    ],
                )
            ],
            job_edges=[],
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
