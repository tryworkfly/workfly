from pydantic import BaseModel, field_validator
from typing import Any, Literal


class TriggerRequest(BaseModel):
    event: str
    config: dict[str, Any]


class StepRequest(BaseModel):
    name: str
    inputs: dict[str, Any]
    id: str  # corresponding to a certain Action in DB


class JobRequest(BaseModel):
    name: str
    steps: list[StepRequest]

    @field_validator("steps")
    @classmethod
    def validate_steps(cls, v):
        if not v:
            raise ValueError("At least one step is required")
        return v


class WorkflowRequest(BaseModel):
    name: str
    runName: str | None = None
    permissions: dict[str, list[Literal["read", "write"]]] | None = None
    trigger: list[TriggerRequest]
    jobs: list[JobRequest]
    jobEdges: list[tuple[str, str]]  # source to target

    @field_validator("trigger")
    @classmethod
    def validate_trigger(cls, v):
        if not v:
            raise ValueError("At least one trigger is required")
        return v

    @field_validator("jobs")
    @classmethod
    def validate_jobs(cls, v):
        if not v:
            raise ValueError("At least one job is required")
        return v

class WorkflowAIRequest(BaseModel):
    prompt: str


class WorkflowResponse(BaseModel):
    message: str
    workflowYaml: str
