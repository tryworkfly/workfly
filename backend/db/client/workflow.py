from typing import Iterable
import uuid
from fastapi import HTTPException
from sqlmodel import Session, select
from .database import engine
from ..model.workflow import Workflow, WorkflowCreate, WorkflowPublic


class WorkflowClient:
    def __enter__(self):
        self._session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._session.close()

    def create(self, workflow_create: WorkflowCreate) -> WorkflowPublic:
        workflow = Workflow.model_validate(workflow_create)
        self._session.add(workflow)
        self._session.commit()
        self._session.refresh(workflow)
        return WorkflowPublic.model_validate(workflow)

    def put(
        self, workflow_id: uuid.UUID, workflow_update: WorkflowCreate
    ) -> WorkflowPublic:
        statement = select(Workflow).where(Workflow.id == workflow_id)
        workflow = self._session.exec(statement).first()
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")

        workflow.sqlmodel_update(workflow_update.model_dump())
        self._session.add(workflow)
        self._session.commit()
        self._session.refresh(workflow)

        return WorkflowPublic.model_validate(workflow)

    def get_all(self) -> Iterable[Workflow]:
        statement = select(Workflow)
        workflows = self._session.exec(statement)
        return workflows

    def get(self, workflow_id: uuid.UUID) -> WorkflowPublic | None:
        statement = select(Workflow).where(Workflow.id == workflow_id)
        workflow = self._session.exec(statement).first()
        return WorkflowPublic.model_validate(workflow) if workflow is not None else None
