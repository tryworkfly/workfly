from fastapi import HTTPException
from sqlmodel import Session
from .database import engine
from ..model.workflow import WorkflowCreate, WorkflowPublic

_test_workflow = WorkflowPublic(
    name="Test workflow",
    trigger=[{"event": "on_push", "config": {}}],
    jobs=[],
    job_edges=[],
    id="test",
)


class WorkflowClient:
    def __init__(self):
        self.db = Session(engine)

    def create(self, workflow: WorkflowCreate) -> WorkflowPublic:
        return WorkflowPublic(
            name=workflow.name,
            trigger=workflow.trigger,
            jobs=workflow.jobs,
            job_edges=workflow.job_edges,
            id="test",
        )

    def get_all(self) -> list[WorkflowPublic]:
        return [_test_workflow]

    def get(self, workflow_id: str) -> WorkflowPublic:
        if _test_workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return _test_workflow

    def put(self, workflow_id: str, workflow: WorkflowCreate) -> WorkflowPublic:
        if _test_workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")

        return _test_workflow
