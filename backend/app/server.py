from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ai.ai_client import AIClient
from db.model.step_definition import StepDefinition
from db.model.workflow import WorkflowCreate, WorkflowPublic
from db.step_definition import StepDefinitionClient
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

    @app.post("/workflows")
    async def create_workflow(workflow: WorkflowCreate) -> WorkflowPublic:
        return WorkflowPublic(
            name="test",
            trigger=[{"event": "test", "config": {}}],
            jobs=[],
            job_edges=[],
            id="test",
        )

    @app.get("/workflows/{workflow_id}")
    async def get_workflow(workflow_id: str) -> WorkflowPublic:
        return WorkflowPublic(
            name="test",
            trigger=[{"event": "test", "config": {}}],
            jobs=[],
            job_edges=[],
            id="test",
        )

    @app.put("/workflows/{workflow_id}")
    async def update_workflow(
        workflow_id: str, workflow: WorkflowCreate
    ) -> WorkflowPublic:
        return WorkflowPublic(
            name="test",
            trigger=[{"event": "test", "config": {}}],
            jobs=[],
            job_edges=[],
            id="test",
        )

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
        step = step_client.get(step_id)
        if step is None:
            raise HTTPException(status_code=404, detail="Step definition not found")
        return step

    return app


app = create_app()
