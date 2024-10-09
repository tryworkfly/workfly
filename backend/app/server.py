from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ai.ai_client import AIClient
from db.step import StepClient
from workflow.workflow_request import (
    WorkflowAIReponse,
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

    @app.post("/workflows")
    async def create_workflow(workflow: WorkflowRequest) -> WorkflowResponse:
        workflow_yaml = WorkflowToYAML.to_yaml(workflow)
        return WorkflowResponse(
            message="Workflow created successfully",
            workflowYaml=workflow_yaml,
        )

    @app.post("/ai")
    async def create_ai_workflow(workflow: WorkflowAIRequest) -> WorkflowAIReponse:
        ai_client = AIClient()
        actions = ai_client.generate_workflow_actions(workflow.prompt)

        return WorkflowAIReponse(
            actions=actions,
        )

    @app.get("/steps")
    async def get_steps():
        step_client = StepClient()
        return step_client.get_all()

    @app.get("/steps/{step_id}")
    async def get_step(step_id: str):
        step_client = StepClient()
        return step_client.get(step_id)

    return app


app = create_app()
