from pydantic import BaseModel, field_validator
from typing import Literal


class TriggerRequest(BaseModel):
    event: str
    config: dict


class StepRequest(BaseModel):
    name: str
    inputs: dict
    uses: str  # corresponding to a certain Action in DB


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
    runName: str
    permissions: dict[str, Literal["read", "write", "none"]]
    trigger: list[TriggerRequest]
    jobs: list[JobRequest]
    job_edges: list[tuple[str, str]]  # source to target

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


class WorkflowResponse(BaseModel):
    message: str
