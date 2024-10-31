import asyncio
import uuid
from fastapi import APIRouter, WebSocket
from pydantic import BaseModel

from db.client import ExportClient, WorkflowClient
from db.model import ExportState


class WSMessage(BaseModel):
    route: str
    payload: dict


async def wait_first(*futures):
    """
    Return the result of the first future to finish. Cancel the remaining futures.
    """
    done, pending = await asyncio.wait(futures, return_when=asyncio.FIRST_COMPLETED)
    gather = asyncio.gather(*pending)
    gather.cancel()
    try:
        await gather
    except asyncio.CancelledError:
        pass
    return done.pop()


async def await_run_completion(websocket: WebSocket, export_id: uuid.UUID):
    while True:
        with ExportClient() as export_client:
            export = export_client.get(export_id)
            if export is None:
                await websocket.send_text(
                    WSMessage(
                        route="error",
                        payload={"message": f"Export id {export_id} does not exist"},
                    ).model_dump_json()
                )
                return

            with WorkflowClient() as workflow_client:
                workflow = workflow_client.get(export.workflow_id)
                if workflow is None or export.state != ExportState.RUNNING:
                    await websocket.send_text(
                        WSMessage(
                            route="export_status_changed",
                            payload={"export_id": export_id},
                        ).model_dump_json()
                    )
                    return
        await asyncio.sleep(1)


def make_router():
    router = APIRouter()

    @router.websocket("/")
    async def websocket_endpoint(websocket: WebSocket):
        await websocket.accept()
        while True:
            data = await websocket.receive_text()

            try:
                message = WSMessage.model_validate_json(data)

                if message.route == "export":
                    export_id = uuid.UUID(message.payload.get("export_id"))
                    if export_id is not None:
                        asyncio.create_task(await_run_completion(websocket, export_id))
            except Exception as e:
                await websocket.send_text(
                    WSMessage(
                        route="error",
                        payload={"message": str(e)},
                    ).model_dump_json()
                )

    return router
