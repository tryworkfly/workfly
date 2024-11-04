from typing import OrderedDict

from fastapi import HTTPException

from db.model import StepDefinition, StepExporter, STEP_EXPORTERS, STEP_EXPORTERS_MAP


class TestStepExporter(StepExporter):
    @staticmethod
    def get_definition() -> StepDefinition:
        return StepDefinition(
            name="Test Step",
            id="test_uses",
            version="v0.0.1",
            category="Test",
            description="Test Step",
            inputs=[],
            required_permissions={"contents": {"read"}},
        )


class TestStepExporter2(StepExporter):
    @staticmethod
    def get_definition() -> StepDefinition:
        return StepDefinition(
            name="Test Step 2",
            id="test_uses_2",
            version="v0.0.1",
            category="Test",
            description="Test Step 2",
            inputs=[],
            required_permissions={"contents": {"write"}},
        )


mock_step_exporters: list[type[StepExporter]] = [
    *STEP_EXPORTERS,
    TestStepExporter,
    TestStepExporter2,
]
mock_step_exporters_map = {
    step_exporter.get_definition().id: step_exporter
    for step_exporter in mock_step_exporters
}


class MockStepDefinitionClient:
    def __init__(self) -> None:
        pass

    def get_all(self):
        return mock_step_exporters

    def get(self, id: str):
        exporter = mock_step_exporters_map.get(id)
        if exporter is None:
            raise HTTPException(status_code=404, detail="Step definition not found")
        return exporter.get_definition()

    def get_exporter(self, id: str):
        return mock_step_exporters_map.get(id)
