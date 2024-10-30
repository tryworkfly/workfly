import enum
from sqlalchemy import Column, Enum
from sqlmodel import Field, SQLModel
import uuid


class RunState(enum.Enum):
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"


class _RunBase(SQLModel):
    state: RunState = Field(sa_column=Column(Enum(RunState)))
    result: str | None = None
    workflow_id: uuid.UUID = Field(foreign_key="workflow.id", unique=True)


### Public Models


class Run(_RunBase, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)


class RunCreate(_RunBase):
    pass


class RunPublic(_RunBase):
    id: uuid.UUID
