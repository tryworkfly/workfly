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


def str_presenter(dumper, data: str):
    if len(data.splitlines()) > 1:  # check for multiline string
        return dumper.represent_scalar("tag:yaml.org,2002:str", data, style="|")
    return dumper.represent_scalar("tag:yaml.org,2002:str", data)


yaml.add_representer(str, str_presenter)


class WorkflowToYAML:
    @staticmethod
    def to_yaml(workflow: WorkflowRequest):
        triggers = WorkflowToYAML._triggers_to_yaml(workflow.trigger)
        jobs, required_permissions = WorkflowToYAML._jobs_to_yaml(
            iter(workflow.jobs), workflow.jobEdges
        )

        permissions = {
            resource: ",".join(actions)
            for resource, actions in required_permissions.items()
        }
        return yaml.dump(
            {
                "name": workflow.name,
                "run-name": workflow.runName,
                "permissions": permissions,
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
    def _merge_required_permissions(
        required_permissions: dict[str, set[str]],
        step_required_permissions: dict[str, set[str]],
    ):
        new_required_permissions = required_permissions.copy()
        for resource, actions in step_required_permissions.items():
            if resource not in new_required_permissions:
                new_required_permissions[resource] = set()
            new_required_permissions[resource].update(actions)

        return new_required_permissions

    @staticmethod
    def _jobs_to_yaml(
        jobs: Iterator[JobRequest], job_edges: list[tuple[str, str]]
    ) -> tuple[dict[str, JobYAML], dict[str, set[str]]]:
        job = next(jobs, None)
        if not job:
            return {}, {}

        dependent_jobs: list[str] = []
        for source, target in job_edges:
            if target == job.name:
                dependent_jobs.append(WorkflowToYAML._make_job_id(source))

        steps_yaml, steps_required_permissions = WorkflowToYAML._steps_to_yaml(
            job.steps
        )
        jobs_yaml, required_permissions = WorkflowToYAML._jobs_to_yaml(jobs, job_edges)

        required_permissions = WorkflowToYAML._merge_required_permissions(
            required_permissions, steps_required_permissions
        )

        job_id = WorkflowToYAML._make_job_id(job.name)
        return (
            {
                **jobs_yaml,
                job_id: {
                    "name": job.name,
                    "runs-on": ["ubuntu-latest"],
                    "needs": dependent_jobs,
                    "steps": steps_yaml,
                },
            },
            required_permissions,
        )

    @staticmethod
    def _validate_step_request(step_request: StepRequest):
        step_db = StepClient()
        step = step_db.get(step_request.id or "")

        if step_request.id is not None:
            if not step:
                raise ValueError(f"Step {step_request.id} not found")
            for input in step.inputs:
                if input.required and (
                    not step_request.inputs or input.name not in step_request.inputs
                ):
                    raise ValueError(f"Input {input.name} not found")
        return step

    @staticmethod
    def _steps_to_yaml(
        step_requests: list[StepRequest],
    ) -> tuple[list[StepActionYAML], dict[str, set[str]]]:
        """
        Returns a tuple of YAMLified steps and required permissions for the steps.
        """
        steps_yaml = []
        required_permissions = dict[str, set[str]]()
        for step_request in step_requests:
            step = WorkflowToYAML._validate_step_request(step_request)

            if step:
                required_permissions = WorkflowToYAML._merge_required_permissions(
                    required_permissions, step.required_permissions
                )

            step_yaml = {
                "name": step_request.name,
                **(
                    {"uses": f"{step_request.id}@{step.version}"}
                    if step_request.id and step
                    else {}
                ),
                **({"with": step_request.inputs} if step_request.inputs else {}),
                **({"run": step_request.run} if step_request.run else {}),
            }

            steps_yaml.append(step_yaml)

        return steps_yaml, required_permissions
