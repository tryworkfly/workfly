from fastapi import APIRouter

from db.client import StepDefinitionClient
from db.model import StepDefinition


def make_router():
    router = APIRouter(prefix="/step_definitions")

    @router.get("/")
    async def get_step_definitions() -> list[StepDefinition]:
        step_client = StepDefinitionClient()
        return step_client.get_all()

    @router.get("/{step_id}")
    async def get_step_definition(step_id: str) -> StepDefinition:
        step_client = StepDefinitionClient()
        return step_client.get(step_id)

    return router
