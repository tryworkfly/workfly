from typing import Any, NotRequired, TypedDict

StepActionYAML = TypedDict(
    "StepActionYAML",
    {
        "name": str,
        "uses": NotRequired[str],
        "with": NotRequired[dict[str, Any]],
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


WorkflowYAML = TypedDict(
    "WorkflowYAML",
    {
        "name": str,
        "run-name": NotRequired[str],
        "permissions": dict[str, str],
        "on": dict[str, dict[str, Any]],
        "jobs": dict[str, JobYAML],
    },
)
