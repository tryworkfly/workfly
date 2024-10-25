from typing import Iterable
import uuid
from fastapi import HTTPException
from sqlmodel import Session, select
from .database import engine
from ..model.workflow import Workflow, WorkflowCreate


class WorkflowClient:
    def __init__(self):
        self._session = Session(engine)

    def create(self, workflow_create: WorkflowCreate) -> Workflow:
        workflow = Workflow.model_validate(workflow_create)
        self._session.add(workflow)
        self._session.commit()
        self._session.refresh(workflow)
        return workflow

    def get_all(self) -> Iterable[Workflow]:
        statement = select(Workflow)
        workflows = self._session.exec(statement)
        return workflows

    def get(self, workflow_id: uuid.UUID) -> Workflow:
        statement = select(Workflow).where(Workflow.id == workflow_id)
        workflow = self._session.exec(statement).first()
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return workflow

    def put(self, workflow_id: uuid.UUID, workflow_update: WorkflowCreate) -> Workflow:
        statement = select(Workflow).where(Workflow.id == workflow_id)
        workflow = self._session.exec(statement).first()
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")

        workflow.sqlmodel_update(workflow_update.model_dump())
        self._session.add(workflow)
        self._session.commit()
        self._session.refresh(workflow)

        return workflow
