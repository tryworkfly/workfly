import enum
from sqlalchemy import Column, Enum
from sqlmodel import Field, SQLModel
import uuid


class ExportState(enum.Enum):
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"


class _ExportBase(SQLModel):
    state: ExportState = Field(sa_column=Column(Enum(ExportState)))
    result: str | None = None
    workflow_id: uuid.UUID = Field(foreign_key="workflow.id")


### Public Models


class Export(_ExportBase, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)


class ExportCreate(_ExportBase):
    pass


class ExportPublic(_ExportBase):
    id: uuid.UUID
