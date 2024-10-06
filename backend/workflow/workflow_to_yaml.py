from typing import Iterator, NotRequired, TypedDict

import yaml

from .workflow_request import JobRequest, StepRequest, TriggerRequest, WorkflowRequest

StepActionYAML = TypedDict(
    "StepActionYAML",
    {
        "name": str,
        "uses": str,
        "with": NotRequired[dict],
    },
)


class StepRunYAML(TypedDict):
    run: str


JobYAML = TypedDict(
    "JobYAML",
    {
        "name": str,
        "runs-on": list[str],
        "needs": list[str],
        "steps": list[StepActionYAML | StepRunYAML],
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
        jobs = WorkflowToYAML._jobs_to_yaml(iter(workflow.jobs), workflow.job_edges)
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
    def _make_job_id(job_name: str) -> str:
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
    def _steps_to_yaml(steps: list[StepRequest]) -> list[StepActionYAML | StepRunYAML]:
        # validate step based on "uses"
        return [
            {
                "name": step.name,
                "uses": step.uses,
                "with": step.inputs,
            }
            for step in steps
        ]
