from pydantic import BaseModel


class Trigger(BaseModel):
    event: str
    config: dict


class Step(BaseModel):
    name: str
    inputs: dict


class Job(BaseModel):
    name: str
    steps: list[Step]


class Workflow(BaseModel):
    name: str
    trigger: list[Trigger]
    jobs: list[Job]
    job_edges: list[tuple[str, str]]  # source to target
