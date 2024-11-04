from fastapi import HTTPException

from ..model.step_definition import StepDefinition
from ..model.step_exporters import StepExporter, STEP_EXPORTERS, STEP_EXPORTERS_MAP


class StepDefinitionClient:
    def __init__(self) -> None:
        pass

    def get_all(self) -> list[StepDefinition]:
        return [step.get_definition() for step in STEP_EXPORTERS]

    def get(self, id: str) -> StepDefinition:
        step = STEP_EXPORTERS_MAP.get(id)
        if step is None:
            raise HTTPException(status_code=404, detail="Step definition not found")
        return step.get_definition()

    def get_exporter(self, id: str) -> type[StepExporter]:
        step = STEP_EXPORTERS_MAP.get(id)
        if step is None:
            raise HTTPException(status_code=404, detail="Step definition not found")
        return step
