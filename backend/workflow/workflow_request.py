from pydantic import BaseModel


class WorkflowAIRequest(BaseModel):
    prompt: str


class WorkflowAIResponse(BaseModel):
    actions: list[str]


class WorkflowResponse(BaseModel):
    message: str
    workflowYaml: str
