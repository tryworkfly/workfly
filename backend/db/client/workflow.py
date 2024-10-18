from fastapi import HTTPException
from sqlmodel import Session
from .database import engine
from ..model.workflow import WorkflowCreate, WorkflowPublic

_test_workflow: WorkflowPublic | None = None


class WorkflowClient:
    def __init__(self):
        self.db = Session(engine)

    def create_workflow(self, workflow: WorkflowCreate) -> WorkflowPublic:
        _test_workflow = WorkflowPublic(
            name=workflow.name,
            trigger=workflow.trigger,
            jobs=workflow.jobs,
            job_edges=workflow.job_edges,
            id="test",
        )
        return _test_workflow

    def get_workflow(self, workflow_id: str) -> WorkflowPublic:
        if _test_workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return _test_workflow
