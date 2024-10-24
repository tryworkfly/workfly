from sqlmodel import Field, SQLModel


class _RunBase(SQLModel):
    state: str  # RUNNING, SUCCESS, FAILED
    result: str | None = None
    workflow_id: str = Field(foreign_key="workflow.id", unique=True)


### Public Models


class Run(_RunBase, table=True):
    id: str | None = Field(default=None, primary_key=True)


class RunCreate(_RunBase):
    pass


class RunPublic(_RunBase):
    id: str
