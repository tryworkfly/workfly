import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.client import RunClient, WorkflowClient
from db.model import RunCreate, RunPublic, WorkflowPublic
from workflow.workflow_to_yaml import WorkflowToYAML


class RunRequest(BaseModel):
    workflow_id: uuid.UUID


router = APIRouter(prefix="/runs")


@router.get("/{run_id}", response_model=RunPublic)
async def get_run(run_id: uuid.UUID):
    run_client = RunClient()
    run = run_client.get(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.post("/", response_model=RunPublic)
async def start_run(run_request: RunRequest):
    workflow_client = WorkflowClient()
    workflow = workflow_client.get(run_request.workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow does not exist")

    workflow_public = WorkflowPublic.model_validate(workflow)

    run_client = RunClient()
    run = RunCreate(state="RUNNING", workflow_id=workflow_public.id)
    run_client.upsert(run)

    workflow_yaml = WorkflowToYAML.to_yaml(workflow)
    finished_run = RunCreate(
        state="SUCCESS", result=workflow_yaml, workflow_id=workflow_public.id
    )
    run = run_client.upsert(finished_run)

    return run
