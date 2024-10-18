from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ai.ai_client import AIClient
from db.client import StepDefinitionClient, WorkflowClient
from db.model import StepDefinition, WorkflowCreate, WorkflowPublic
from workflow.workflow_request import (
    WorkflowAIResponse,
    WorkflowAIRequest,
    WorkflowRequest,
    WorkflowResponse,
)
from workflow.workflow_to_yaml import WorkflowToYAML


def create_app():
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": str(exc),
            },
        )

    # @app.post("/workflows")
    # async def create_workflow(workflow: WorkflowRequest) -> WorkflowResponse:
    #     workflow_yaml = WorkflowToYAML.to_yaml(workflow)
    #     return WorkflowResponse(
    #         message="Workflow created successfully",
    #         workflowYaml=workflow_yaml,
    #     )

    @app.get("/workflows")
    async def list_workflows() -> list[WorkflowPublic]:
        workflow_client = WorkflowClient()
        return workflow_client.get_all()

    @app.post("/workflows")
    async def create_workflow(workflow: WorkflowCreate) -> WorkflowPublic:
        workflow_client = WorkflowClient()
        return workflow_client.create(workflow)

    @app.get("/workflows/{workflow_id}")
    async def get_workflow(workflow_id: str) -> WorkflowPublic:
        workflow_client = WorkflowClient()
        return workflow_client.get(workflow_id)

    @app.put("/workflows/{workflow_id}")
    async def update_workflow(
        workflow_id: str, workflow: WorkflowCreate
    ) -> WorkflowPublic:
        workflow_client = WorkflowClient()
        return workflow_client.put(workflow_id, workflow)

    @app.post("/ai")
    async def create_ai_workflow(workflow: WorkflowAIRequest) -> WorkflowAIResponse:
        ai_client = AIClient()
        actions = ai_client.generate_workflow_actions(workflow.prompt)

        return WorkflowAIResponse(
            actions=actions,
        )

    @app.get("/step_definitions")
    async def get_step_definitions() -> list[StepDefinition]:
        step_client = StepDefinitionClient()
        return step_client.get_all()

    @app.get("/step_definitions/{step_id}")
    async def get_step_definition(step_id: str) -> StepDefinition:
        step_client = StepDefinitionClient()
        return step_client.get(step_id)

    return app


app = create_app()
