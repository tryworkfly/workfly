from fastapi import FastAPI
from .workflow import Workflow


def create_app():
    app = FastAPI()

    @app.post("/workflow")
    async def create_workflow(workflow: Workflow):
        return {
            "message": "Workflow created successfully",
            "workflow": workflow.model_dump(),
        }

    @app.get("/")
    async def root():
        return {"message": "Welcome to the Workflow API"}

    return app


app = create_app()
