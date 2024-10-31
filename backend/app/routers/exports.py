import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from tasks.tasks import convert_workflow
from db.client import ExportClient, WorkflowClient
from db.model import ExportCreate, ExportPublic, ExportState


class ExportRequest(BaseModel):
    workflow_id: uuid.UUID


def make_router():
    router = APIRouter(prefix="/exports")

    @router.get("/{export_id}")
    async def get_export(export_id: uuid.UUID) -> ExportPublic:
        with ExportClient() as export_client:
            export = export_client.get(export_id)
            if export is None:
                raise HTTPException(status_code=404, detail="Export not found")
        return export

    @router.get("/")
    async def get_all(workflow_id: uuid.UUID | None = None) -> list[ExportPublic]:
        with ExportClient() as export_client:
            if workflow_id:
                return list(export_client.get_all_by_workflow_id(workflow_id))
            else:
                return list(export_client.get_all())

    @router.post("/")
    async def start_export(export_request: ExportRequest) -> ExportPublic:
        with WorkflowClient() as workflow_client:
            workflow = workflow_client.get(export_request.workflow_id)
            if workflow is None:
                raise HTTPException(status_code=404, detail="Workflow does not exist")

        with ExportClient() as export_client:
            export = export_client.create(
                ExportCreate(
                    state=ExportState.RUNNING, workflow_id=workflow.id, result=None
                )
            )

        convert_workflow.delay(export.id)

        return export

    return router
