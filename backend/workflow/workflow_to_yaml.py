from typing import Iterator
import yaml

from .github_yaml import JobYAML, StepActionYAML, WorkflowYAML
from db.model import Edge, Job, Step, Trigger, Workflow
from db.client.step_definition import StepDefinitionClient


def str_presenter(dumper, data: str):
    if len(data.splitlines()) > 1:  # check for multiline string
        return dumper.represent_scalar("tag:yaml.org,2002:str", data, style="|")
    return dumper.represent_scalar("tag:yaml.org,2002:str", data)


yaml.add_representer(str, str_presenter)


class WorkflowToYAML:
    @staticmethod
    def to_yaml(workflow: Workflow):
        triggers = WorkflowToYAML._trigger_to_yaml(workflow.trigger)
        jobs, required_permissions = WorkflowToYAML._jobs_to_yaml(
            iter(workflow.jobs), workflow.job_edges
        )

        permissions = {
            resource: ",".join(actions)
            for resource, actions in required_permissions.items()
        }

        return yaml.dump(
            {
                "name": workflow.name,
                **({"run-name": workflow.run_name} if workflow.run_name else {}),
                "permissions": permissions,
                "on": triggers,
                "jobs": jobs,
            },
            sort_keys=False,
        )

    @staticmethod
    def _trigger_to_yaml(trigger: Trigger):
        return {
            trigger["event"]: trigger["config"] for trigger in trigger["conditions"]
        }

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
        jobs: Iterator[Job], job_edges: list[Edge]
    ) -> tuple[dict[str, JobYAML], dict[str, set[str]]]:
        job = next(jobs, None)
        if not job:
            return {}, {}

        dependent_jobs: list[str] = []
        for edge in job_edges:
            if edge["target"] == job["name"]:
                dependent_jobs.append(WorkflowToYAML._make_job_id(edge["source"]))

        steps_yaml, steps_required_permissions = WorkflowToYAML._steps_to_yaml(
            job["steps"], job["step_edges"]
        )
        jobs_yaml, required_permissions = WorkflowToYAML._jobs_to_yaml(jobs, job_edges)

        required_permissions = WorkflowToYAML._merge_required_permissions(
            required_permissions, steps_required_permissions
        )

        job_id = WorkflowToYAML._make_job_id(job["name"])
        return (
            {
                **jobs_yaml,
                job_id: {
                    "name": job["name"],
                    "runs-on": ["ubuntu-latest"],
                    "needs": dependent_jobs,
                    "steps": steps_yaml,
                },
            },
            required_permissions,
        )

    @staticmethod
    def _validate_step_request(step_request: Step):
        step_db = StepDefinitionClient()
        StepExporter = step_db.get_exporter(step_request["step_id"])

        if not StepExporter:
            raise ValueError(f"Step {step_request["step_id"]} not found")
        for input in StepExporter.get_definition().inputs:
            if input.required and (
                not step_request["inputs"] or input.name not in step_request["inputs"]
            ):
                raise ValueError(f"Input {input.name} not found")
        return StepExporter

    @staticmethod
    def _steps_to_yaml(
        steps: list[Step], step_edges: list[Edge]
    ) -> tuple[list[StepActionYAML], dict[str, set[str]]]:
        """
        Returns a tuple of YAMLified steps and required permissions for the steps.
        """

        steps_yaml = []
        required_permissions = dict[str, set[str]]()

        ordered_steps = WorkflowToYAML._get_ordered_steps(steps, step_edges)

        for step in ordered_steps:
            StepExporter = WorkflowToYAML._validate_step_request(step)

            required_permissions = WorkflowToYAML._merge_required_permissions(
                required_permissions, StepExporter.get_definition().required_permissions
            )

            steps_yaml.append(StepExporter().to_github_yaml(step))

        return steps_yaml, required_permissions

    @staticmethod
    def _get_ordered_steps(steps: list[Step], step_edges: list[Edge]):
        """Works off assumption that steps are a linear list with 1..1 with each other"""
        dag: dict[str, str] = {edge["source"]: edge["target"] for edge in step_edges}

        def get_ordered_step_ids(start_step: str, path: list[str] = []) -> list[str]:
            path = path + [start_step]
            if start_step not in dag:
                return path
            return get_ordered_step_ids(dag[start_step], path)

        first_step_id = None
        for step_request in steps:
            if not any(edge["target"] == step_request["id"] for edge in step_edges):
                first_step_id = step_request["id"]
                break

        if first_step_id is None:
            # ?????
            raise Exception("No first step found??? How??")

        linear_order = get_ordered_step_ids(first_step_id)
        reordered_step_requests = [step for step in steps if step["id"] in linear_order]
        return reordered_step_requests
