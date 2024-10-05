from typing import NotRequired, TypedDict

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
    def to_yaml(workflow: WorkflowRequest) -> WorkflowYAML:
        triggers = WorkflowToYAML.triggers_to_yaml(workflow.trigger)
        jobs = WorkflowToYAML.jobs_to_yaml(workflow.jobs)
        return {
            "name": workflow.name,
            "run-name": workflow.runName,
            "permissions": workflow.permissions,
            "on": triggers,
            "jobs": jobs,
        }

    @staticmethod
    def triggers_to_yaml(triggers: list[TriggerRequest]) -> dict[str, dict]:
        return {trigger.event: trigger.config for trigger in triggers}

    @staticmethod
    def jobs_to_yaml(jobs: list[JobRequest]) -> dict[str, JobYAML]:
        return {
            job.name.lower().replace(" ", "-"): {
                "name": job.name,
                "runs-on": ["linux"],
                "needs": [],
                "steps": WorkflowToYAML.steps_to_yaml(job.steps),
            }
            for job in jobs
        }

    @staticmethod
    def steps_to_yaml(steps: list[StepRequest]) -> list[StepActionYAML | StepRunYAML]:
        return [
            {
                "name": step.name,
                "uses": step.uses,
                "with": step.inputs,
            }
            for step in steps
        ]
