from sqlmodel import Session, select
from typing import Iterable
import uuid

from ..model.run import Run, RunCreate
from .database import engine


class RunClient:
    def __init__(self):
        self._session = Session(engine)

    def upsert(self, run_create: RunCreate) -> Run:
        statement = select(Run).where(Run.workflow_id == run_create.workflow_id)
        run = self._session.exec(statement).first()
        if run is None:
            run = Run.model_validate(run_create)
            self._session.add(run)
        else:
            run.sqlmodel_update(run_create.model_dump())
            self._session.add(run)

        self._session.commit()
        self._session.refresh(run)

        return run

    def get_all(self) -> Iterable[Run]:
        statement = select(Run)
        runs = self._session.exec(statement)
        return runs

    def get(self, run_id: uuid.UUID) -> Run | None:
        statement = select(Run).where(Run.id == run_id)
        run = self._session.exec(statement).first()
        return run

    def get_by_workflow_id(self, workflow_id: uuid.UUID) -> Run | None:
        statement = select(Run).where(Run.workflow_id == workflow_id)
        run = self._session.exec(statement).first()
        return run
