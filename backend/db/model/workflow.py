from __future__ import annotations
from typing import Any, TypedDict
import uuid
from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


# class _JobBase(SQLModel):
#     name: str
#     steps: list[WorkflowStep] = Field(sa_column=Column(JSON))
#     workflow_id: str | None = Field(default=None, foreign_key="workflow.id")


class _WorkflowBase(SQLModel):
    name: str
    runName: str | None = None
    trigger: list[Trigger] = Field(sa_column=Column(JSON))
    jobs: list[Job] = Field(sa_column=Column(JSON))
    job_edges: list[list[str]] = Field(sa_column=Column(JSON))  # list of (source, edge)

    class Config:
        arbitrary_types_allowed = True


### Public Models


class Step(TypedDict):
    name: str
    inputs: dict[str, Any]
    step_id: str  # corresponding to a certain Action in DB


class Job(TypedDict):
    name: str
    steps: list[Step]


class Trigger(TypedDict):
    event: str
    config: dict


class Workflow(_WorkflowBase, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)


class WorkflowCreate(_WorkflowBase):
    pass


class WorkflowPublic(_WorkflowBase):
    id: uuid.UUID
