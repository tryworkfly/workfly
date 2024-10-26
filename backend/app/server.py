from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers import runs, step_definitions, workflows
from ai.ai_client import AIClient
from workflow.workflow_request import (
    WorkflowAIResponse,
    WorkflowAIRequest,
)


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

    @app.post("/ai")
    async def create_ai_workflow(workflow: WorkflowAIRequest) -> WorkflowAIResponse:
        ai_client = AIClient()
        actions = ai_client.generate_workflow_actions(workflow.prompt)

        return WorkflowAIResponse(
            actions=actions,
        )

    app.include_router(workflows.router)
    app.include_router(step_definitions.router)
    app.include_router(runs.router)

    return app


app = create_app()
