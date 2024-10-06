from pydantic import BaseModel, field_validator, ValidationInfo
from typing import Literal


class TriggerRequest(BaseModel):
    event: str
    config: dict


class StepRequest(BaseModel):
    name: str
    inputs: dict | None
    id: str | None  # corresponding to a certain Action in DB
    run: str | None = None
    """Command to run at given step"""

    @field_validator("run")
    @classmethod
    def validate_run(cls, v: str | None, info: ValidationInfo) -> str | None:
        if info.data.get("id") is None and v is None:
            raise ValueError("Either 'id' or 'run' must be defined")
        if info.data.get("id") and v is not None:
            raise ValueError("'id' and 'run' cannot be used together")
        if info.data.get("inputs") and v is not None:
            raise ValueError("'inputs' and 'run' cannot be used together")
        return v


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


class WorkflowResponse(BaseModel):
    message: str
    workflowYaml: str
