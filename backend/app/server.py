from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from workflow.workflow_request import WorkflowRequest, WorkflowResponse
from workflow.workflow_to_yaml import WorkflowToYAML

def create_app():
    app = FastAPI()

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": str(exc),
            },
        )

    @app.post("/workflow")
    async def create_workflow(workflow: WorkflowRequest) -> WorkflowResponse:
        workflow_yaml = WorkflowToYAML.to_yaml(workflow)
        return WorkflowResponse(
            message="Workflow created successfully",
            workflowYaml=workflow_yaml,
        )

    @app.get("/")
    async def root():
        return {"message": "Welcome to the Workflow API"}

    return app


app = create_app()
