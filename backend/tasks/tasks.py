import uuid
from db.model import ExportCreate, ExportState, Workflow
from db.client import ExportClient, WorkflowClient
from workflow.workflow_to_yaml import WorkflowToYAML
from .celery import app


@app.task(ignore_result=True)
def convert_workflow(export_id: uuid.UUID):
    with ExportClient() as export_client:
        export = export_client.get(export_id)
        if export is None:
            raise Exception("Export does not exist")

        with WorkflowClient() as workflow_client:
            workflow = workflow_client.get(export.workflow_id)
            if workflow is None:
                export_client.put(
                    export.id,
                    ExportCreate(
                        state=ExportState.FAILED,
                        result="Could not find workflow",
                        workflow_id=export.workflow_id,
                    ),
                )
                return

        converted_yaml = WorkflowToYAML.to_yaml(Workflow.model_validate(workflow))
        export_client.put(
            export.id,  
            ExportCreate(
                state=ExportState.SUCCEEDED,
                result=converted_yaml,
                workflow_id=workflow.id,
            ),
        )
