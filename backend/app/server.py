from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db.step import StepClient
from workflow.workflow_request import WorkflowAIRequest, WorkflowRequest, WorkflowResponse
from workflow.workflow_to_yaml import WorkflowToYAML

import json
from openai import OpenAI
# from huggingface_hub import InferenceClient, InferenceEndpoint
from dotenv import load_dotenv
import os


def create_app():
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": str(exc),
            },
        )

    @app.post("/workflows")
    async def create_workflow(workflow: WorkflowRequest) -> WorkflowResponse:
        workflow_yaml = WorkflowToYAML.to_yaml(workflow)
        return WorkflowResponse(
            message="Workflow created successfully",
            workflowYaml=workflow_yaml,
        )

    @app.post("/ai")
    async def create_ai_workflow(workflow: WorkflowAIRequest) -> JSONResponse:
        # workflow_yaml = WorkflowToYAML.to_yaml(workflow)
        # return WorkflowResponse(
        #     message="AI Workflow created successfully",
        # )
        load_dotenv()
        account_id = os.getenv("ACCOUNT_ID")
        gateway_id = os.getenv("GATEWAY_ID")
        model_id = "gpt-4o"
        api_token = os.getenv("API_TOKEN")

        if not account_id or not gateway_id or not model_id or not api_token:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "message": "Missing environment variables",
                },
            )

        # base_url = f"https://gateway.ai.cloudflare.com/v1/${account_id}/${gateway_id}/huggingface/${model_id}"
        # client = InferenceEndpoint(token=api_token, base_url=base_url)
        # print(client)
        # client.text_classification("Hello, world!")
        # client.

        system_prompt = """
        You will help the user return a list of actions that is ordered by what the users mention. The only valid actions are: 
        "Run Code", "Random Rickroll", "Super Linter", "Checkout", "Deploy to GitHub Pages".
        Only return these actions in an array and nothing else without [].
        """

        client = OpenAI(api_key=api_token)
        chat_response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": workflow.prompt},
            ],
            model=model_id
        ) 

        print(chat_response.choices[0].message.content)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "AI Workflow created successfully",
                "response": chat_response.choices[0].message.content.split(', '),
            },
        )


    @app.get("/steps")
    async def get_steps():
        step_client = StepClient()
        return step_client.get_all()

    @app.get("/steps/{step_id}")
    async def get_step(step_id: str):
        step_client = StepClient()
        return step_client.get(step_id)

    return app


app = create_app()
