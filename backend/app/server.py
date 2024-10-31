from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers import ai, exports, step_definitions, websocket, workflows


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

    app.include_router(workflows.make_router())
    app.include_router(step_definitions.make_router())
    app.include_router(exports.make_router())
    app.include_router(ai.make_router())
    app.include_router(websocket.make_router())

    return app


app = create_app()
