import os
from openai import OpenAI


class AIClient:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self._client = OpenAI(api_key=api_key)
        self._model_id = "gpt-4o"

    def generate_workflow_actions(self, prompt: str) -> list[str]:
        system_prompt = """
        You will help the user return a list of actions that is ordered by what the users mention. The only valid actions are: 
        "Run Code", "Random Rickroll", "Super Linter", "Checkout", "Deploy to GitHub Pages".
        Only return these actions in an array and nothing else without [].
        """

        response = self._client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            model=self._model_id,
        )
        return response.choices[0].message.content.split(", ")
