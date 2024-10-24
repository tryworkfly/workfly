from fastapi import APIRouter

from db.client import RunClient
from db.model import RunPublic
from workflow.workflow_request import WorkflowRequest
from workflow.workflow_to_yaml import WorkflowToYAML


router = APIRouter(prefix="/runs")


@router.get("/{run_id}")
async def get_run(run_id: str) -> RunPublic:
    run_client = RunClient()
    return run_client.get("test")


@router.post("/")
async def start_run(workflow: WorkflowRequest) -> RunPublic:
    run_client = RunClient()
    workflow_yaml = WorkflowToYAML.to_yaml(workflow)
    return run_client.get("test")
