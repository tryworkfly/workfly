import uuid
from db.model import RunCreate, RunState, Workflow
from db.client import RunClient, WorkflowClient
from workflow.workflow_to_yaml import WorkflowToYAML
from .celery import app


@app.task(ignore_result=True)
def convert_workflow(workflow_id: uuid.UUID):
    with RunClient() as run_client:
        with WorkflowClient() as workflow_client:
            workflow = workflow_client.get(workflow_id)
            if workflow is None:
                run_client.upsert(
                    RunCreate(
                        state=RunState.FAILED,
                        result="Could not find workflow",
                        workflow_id=workflow_id,
                    )
                )
                return

        converted_yaml = WorkflowToYAML.to_yaml(Workflow.model_validate(workflow))
        run_client.upsert(
            RunCreate(
                state=RunState.SUCCEEDED, result=converted_yaml, workflow_id=workflow.id
            )
        )
