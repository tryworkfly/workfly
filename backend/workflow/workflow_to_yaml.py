from typing import Iterator, NotRequired, TypedDict
import yaml

from db.step import StepClient
from .workflow_request import JobRequest, StepRequest, TriggerRequest, WorkflowRequest


StepActionYAML = TypedDict(
    "StepActionYAML",
    {
        "name": str,
        "uses": NotRequired[str],
        "with": NotRequired[dict],
        "run": NotRequired[str],
    },
)


JobYAML = TypedDict(
    "JobYAML",
    {
        "name": str,
        "runs-on": list[str],
        "needs": list[str],
        "steps": list[StepActionYAML],
    },
)


class WorkflowYAML(TypedDict):
    name: str
    run_name: str
    permissions: dict[str, str]
    on: dict[str, dict]
    jobs: dict[str, JobYAML]


class WorkflowToYAML:
    @staticmethod
    def to_yaml(workflow: WorkflowRequest):
        triggers = WorkflowToYAML._triggers_to_yaml(workflow.trigger)
        jobs = WorkflowToYAML._jobs_to_yaml(iter(workflow.jobs), workflow.jobEdges)
        return yaml.dump(
            {
                "name": workflow.name,
                "run-name": workflow.runName,
                "permissions": workflow.permissions,
                "on": triggers,
                "jobs": jobs,
            },
            sort_keys=False,
        )

    @staticmethod
    def _triggers_to_yaml(triggers: list[TriggerRequest]) -> dict[str, dict]:
        return {trigger.event: trigger.config for trigger in triggers}

    @staticmethod
    def _make_job_id(job_name: str):
        return job_name.lower().replace(" ", "-")

    @staticmethod
    def _jobs_to_yaml(
        jobs: Iterator[JobRequest], job_edges: list[tuple[str, str]]
    ) -> dict[str, JobYAML]:
        job = next(jobs, None)
        if not job:
            return {}

        dependent_jobs: list[str] = []
        for source, target in job_edges:
            if target == job.name:
                dependent_jobs.append(WorkflowToYAML._make_job_id(source))

        job_id = WorkflowToYAML._make_job_id(job.name)
        return {
            **WorkflowToYAML._jobs_to_yaml(jobs, job_edges),
            job_id: {
                "name": job.name,
                "runs-on": ["linux"],
                "needs": dependent_jobs,
                "steps": WorkflowToYAML._steps_to_yaml(job.steps),
            },
        }

    @staticmethod
    def _steps_to_yaml(step_requests: list[StepRequest]) -> list[StepActionYAML]:
        step_db = StepClient()
        steps_yaml = []
        for step_request in step_requests:
            # Validate step id and inputs
            if step_request.id is not None:
                step = step_db.get(step_request.id)
                if not step:
                    raise ValueError(f"Step {step_request.id} not found")
                for input in step.inputs:
                    if input.required and (
                        not step_request.inputs or input.name not in step_request.inputs
                    ):
                        raise ValueError(f"Input {input.name} not found")

            step_yaml = {
                "name": step_request.name,
                "uses": f"{step_request.id}@{step.version}"
                if step_request.id
                else None,
                "with": step_request.inputs,
                "run": step_request.run,
            }

            steps_yaml.append(step_yaml)

        return steps_yaml
