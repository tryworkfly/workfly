from fastapi import APIRouter
from pydantic import BaseModel

from ai.ai_client import AIClient


class WorkflowAIRequest(BaseModel):
    prompt: str


class WorkflowAIResponse(BaseModel):
    actions: list[str]


router = APIRouter(prefix="/ai")


@router.post("/")
async def create_ai_workflow(workflow: WorkflowAIRequest) -> WorkflowAIResponse:
    ai_client = AIClient()
    actions = ai_client.generate_workflow_actions(workflow.prompt)

    return WorkflowAIResponse(
        actions=actions,
    )
