import uuid
from fastapi import APIRouter, HTTPException

from db.client import WorkflowClient
from db.model import WorkflowCreate, WorkflowPublic


router = APIRouter(prefix="/workflows")


@router.get("/", response_model=list[WorkflowPublic])
async def list_workflows():
    with WorkflowClient() as workflow_client:
        return list(workflow_client.get_all())


@router.get("/{workflow_id}", response_model=WorkflowPublic)
async def get_workflow(workflow_id: uuid.UUID):
    with WorkflowClient() as workflow_client:
        workflow = workflow_client.get(workflow_id)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.post("/", response_model=WorkflowPublic)
async def create_workflow(workflow: WorkflowCreate):
    with WorkflowClient() as workflow_client:
        return workflow_client.create(workflow)


@router.put("/{workflow_id}", response_model=WorkflowPublic)
async def update_workflow(workflow_id: uuid.UUID, workflow: WorkflowCreate):
    with WorkflowClient() as workflow_client:
        return workflow_client.put(workflow_id, workflow)
