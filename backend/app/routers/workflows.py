from fastapi import APIRouter

from db.client import WorkflowClient
from db.model import WorkflowCreate, WorkflowPublic


router = APIRouter(prefix="/workflows")


@router.get("/")
async def list_workflows() -> list[WorkflowPublic]:
    workflow_client = WorkflowClient()
    return workflow_client.get_all()


@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str) -> WorkflowPublic:
    workflow_client = WorkflowClient()
    return workflow_client.get(workflow_id)


@router.post("/")
async def create_workflow(workflow: WorkflowCreate) -> WorkflowPublic:
    workflow_client = WorkflowClient()
    return workflow_client.create(workflow)


@router.put("/{workflow_id}")
async def update_workflow(workflow_id: str, workflow: WorkflowCreate) -> WorkflowPublic:
    workflow_client = WorkflowClient()
    return workflow_client.put(workflow_id, workflow)
