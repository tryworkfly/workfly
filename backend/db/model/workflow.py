from __future__ import annotations
from typing import Any, Literal, TypedDict
import uuid
from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


# class _JobBase(SQLModel):
#     name: str
#     steps: list[WorkflowStep] = Field(sa_column=Column(JSON))
#     workflow_id: str | None = Field(default=None, foreign_key="workflow.id")


class _WorkflowBase(SQLModel):
    name: str
    run_name: str | None = None
    trigger: Trigger = Field(sa_column=Column(JSON))
    jobs: list[Job] = Field(sa_column=Column(JSON))
    job_edges: list[Edge] = Field(sa_column=Column(JSON))
    """Edge sources/targets are the job names, not the IDs as that simplifies conversion"""

    class Config:
        arbitrary_types_allowed = True


### Public Models


class XYPosition(TypedDict):
    x: float
    y: float


class Edge(TypedDict):
    id: str
    source: str
    target: str


class Step(TypedDict):
    id: str
    name: str
    position: XYPosition
    inputs: dict[str, Any]
    step_id: str  # corresponding to a certain Action in DB


class Job(TypedDict):
    id: str
    name: str
    steps: list[Step]
    step_edges: list[Edge]


class TriggerCondition(TypedDict):
    event: str
    config: dict


class Trigger(TypedDict):
    id: str
    position: XYPosition
    conditions: list[TriggerCondition]


class Workflow(_WorkflowBase, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)


class WorkflowCreate(_WorkflowBase):
    pass


class WorkflowPublic(_WorkflowBase):
    id: uuid.UUID
