from fastapi import HTTPException
from ..model.run import RunCreate, RunPublic
from .database import engine
from sqlmodel import Session

_test_run = RunPublic(id="test", state="RUNNING", result=None, workflow_id="test")


class RunClient:
    def __init__(self):
        self.db = Session(engine)

    def upsert(self, run: RunCreate) -> RunPublic:
        return _test_run

    def get_all(self) -> list[RunPublic]:
        return [_test_run]

    def get(self, run_id: str) -> RunPublic:
        if _test_run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        return _test_run
