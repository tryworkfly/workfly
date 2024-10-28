from unittest.mock import patch
import yaml

from db.model import Edge, Job, Step, Trigger, TriggerCondition, Workflow
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
            "run-name": workflow_request.run_name,
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
            run_name="test_workflow_run",
            trigger=Trigger(
                id="",
                position={"x": 0, "y": 0},
                conditions=[TriggerCondition(event="test_event", config={})],
            ),
            jobs=[
                Job(
                    id="",
                    name="Test Job Request",
                    steps=[
                        Step(
                            id="",
                            name="Test Step",
                            position={"x": 0, "y": 0},
                            inputs={},
                            step_id="test_uses",
                        )
                    ],
                    step_edges=[],
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
            run_name="test_workflow_run",
            trigger=Trigger(
                id="",
                position={"x": 0, "y": 0},
                conditions=[TriggerCondition(event="test_event", config={})],
            ),
            jobs=[
                Job(
                    id="",
                    name="Test Job Request",
                    steps=[
                        Step(
                            id="",
                            name="Test Step",
                            position={"x": 0, "y": 0},
                            inputs={"code": "echo 'Hello, World!'"},
                            step_id="custom/code",
                        )
                    ],
                    step_edges=[],
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
            run_name="test_workflow_run",
            trigger=Trigger(
                id="",
                position={"x": 0, "y": 0},
                conditions=[TriggerCondition(event="test_event", config={})],
            ),
            jobs=[
                Job(
                    id="1",
                    name="Test Job Request",
                    steps=[
                        Step(
                            id="",
                            position={"x": 0, "y": 0},
                            name="Test Step",
                            inputs={},
                            step_id="test_uses",
                        )
                    ],
                    step_edges=[],
                ),
                Job(
                    id="2",
                    name="Test Job Request 2",
                    steps=[
                        Step(
                            id="",
                            position={"x": 0, "y": 0},
                            name="Test Step 2",
                            inputs={},
                            step_id="test_uses_2",
                        )
                    ],
                    step_edges=[],
                ),
            ],
            job_edges=[
                Edge(id="", source="Test Job Request", target="Test Job Request 2")
            ],
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
            run_name="Deploy to GitHub Pages",
            trigger=Trigger(
                id="",
                position={"x": 0, "y": 0},
                conditions=[
                    TriggerCondition(event="push", config={"branches": ["main"]})
                ],
            ),
            jobs=[
                Job(
                    id="",
                    name="Build and Deploy",
                    steps=[
                        Step(
                            id="1",
                            position={"x": 0, "y": 0},
                            name="Checkout",
                            inputs={},
                            step_id="actions/checkout",
                        ),
                        Step(
                            id="2",
                            position={"x": 0, "y": 0},
                            name="Install and Build",
                            inputs={"code": "npm ci\nnpm run build"},
                            step_id="custom/code",
                        ),
                        Step(
                            id="3",
                            position={"x": 0, "y": 0},
                            name="Deploy",
                            inputs={
                                "folder": "dist",
                            },
                            step_id="JamesIves/github-pages-deploy-action",
                        ),
                    ],
                    step_edges=[
                        Edge(id="", source="2", target="1"),
                        Edge(id="", source="3", target="2"),
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
