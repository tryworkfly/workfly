from sqlmodel import Field, SQLModel
import uuid


class _RunBase(SQLModel):
    state: str  # RUNNING, SUCCESS, FAILED
    result: str | None = None
    workflow_id: uuid.UUID = Field(foreign_key="workflow.id", unique=True)


### Public Models


class Run(_RunBase, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)


class RunCreate(_RunBase):
    pass


class RunPublic(_RunBase):
    id: uuid.UUID
