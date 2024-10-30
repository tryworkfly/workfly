from sqlmodel import Session, select
from typing import Iterable
import uuid

from ..model.run import Run, RunCreate, RunPublic
from .database import engine


class RunClient:
    def __enter__(self):
        self._session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._session.close()

    def upsert(self, run_create: RunCreate) -> RunPublic:
        """Workflows to Runs have a 1 to 0..1 relationship so upserts are done by workflow ID"""
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

        return RunPublic.model_validate(run)

    def get_all(self) -> Iterable[RunPublic]:
        statement = select(Run)
        runs = self._session.exec(statement)
        return [RunPublic.model_validate(run) for run in runs]

    def get(self, run_id: uuid.UUID) -> RunPublic | None:
        statement = select(Run).where(Run.id == run_id)
        run = self._session.exec(statement).first()
        return RunPublic.model_validate(run) if run is not None else None

    def get_by_workflow_id(self, workflow_id: uuid.UUID) -> RunPublic | None:
        statement = select(Run).where(Run.workflow_id == workflow_id)
        run = self._session.exec(statement).first()
        return RunPublic.model_validate(run) if run is not None else None
