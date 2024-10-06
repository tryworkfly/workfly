from unittest.mock import patch
import yaml

from tests.mocks.db.step import MockStepClient
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

    @patch("workflow.workflow_to_yaml.StepClient", new=MockStepClient)
    def test_simple_workflow(self):
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
            on={"test_event": {}},
            jobs={
                "test-job-request": {
                    "name": "Test Job Request",
                    "runs-on": ["linux"],
                    "needs": [],
                    "steps": [
                        {
                            "name": "Test Step",
                            "uses": "test_uses@v0.0.1",
                            "with": {},
                            "run": None,
                        }
                    ],
                }
            },
        )

    @patch("workflow.workflow_to_yaml.StepClient", new=MockStepClient)
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
                            id="test_uses",
                            run="ls",
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
                            run="echo",
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
            on={"test_event": {}},
            jobs={
                "test-job-request": {
                    "name": "Test Job Request",
                    "runs-on": ["linux"],
                    "needs": [],
                    "steps": [
                        {
                            "name": "Test Step",
                            "uses": "test_uses@v0.0.1",
                            "with": {},
                            "run": "ls",
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
                            "uses": "test_uses@v0.0.1",
                            "with": {},
                            "run": "echo",
                        }
                    ],
                },
            },
        )

    @patch("workflow.workflow_to_yaml.StepClient", new=MockStepClient)
    def test_checkout_then_build(self):
        workflow = WorkflowRequest(
            name="Deploy to GitHub Pages",
            runName="Deploy to GitHub Pages",
            permissions={
                "contents": "read",
                "pages": "write",
                "id-token": "write",
            },
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

        yaml = WorkflowToYAML.to_yaml(workflow)
        self._assert_yaml_equal(
            yaml,
            workflow,
            on={"push": {"branches": ["main"]}},
            jobs={
                "build-and-deploy": {
                    "name": "Build and Deploy",
                    "runs-on": ["linux"],
                    "needs": [],
                    "steps": [
                        {
                            "name": "Checkout",
                            "uses": "actions/checkout@v4.2.0",
                            "with": None,
                            "run": None,
                        },
                        {
                            "name": "Install and Build",
                            "uses": None,
                            "with": None,
                            "run": "npm ci\nnpm run build",
                        },
                        {
                            "name": "Deploy",
                            "uses": "JamesIves/github-pages-deploy-action@v4.6.8",
                            "with": {
                                "folder": "dist",
                            },
                            "run": None,
                        },
                    ],
                }
            },
        )
