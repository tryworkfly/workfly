import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from tasks.tasks import convert_workflow
from db.client import RunClient, WorkflowClient
from db.model import RunCreate, RunPublic, RunState


class RunRequest(BaseModel):
    workflow_id: uuid.UUID


def make_router():
    router = APIRouter(prefix="/runs")

    @router.get("/{run_id}")
    async def get_run(run_id: uuid.UUID) -> RunPublic:
        with RunClient() as run_client:
            run = run_client.get(run_id)
            if run is None:
                raise HTTPException(status_code=404, detail="Run not found")
        return run

    @router.get("/")
    async def get_run_by_workflow(workflow_id: uuid.UUID):
        with RunClient() as run_client:
            run = run_client.get_by_workflow_id(workflow_id)
            if run is None:
                raise HTTPException(status_code=404, detail="Run not found")
        return run

    @router.post("/")
    async def start_run(run_request: RunRequest) -> RunPublic:
        with WorkflowClient() as workflow_client:
            workflow = workflow_client.get(run_request.workflow_id)
            if workflow is None:
                raise HTTPException(status_code=404, detail="Workflow does not exist")

        with RunClient() as run_client:
            run = run_client.upsert(
                RunCreate(state=RunState.RUNNING, workflow_id=workflow.id, result=None)
            )

        convert_workflow.delay(workflow.id)

        return run

    return router
