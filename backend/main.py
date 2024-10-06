import uvicorn
import dotenv


def load_config():
    config = dotenv.dotenv_values(".env")
    return config


if __name__ == "__main__":
    config = load_config()
    port = config.get("PORT") or 8000
    env = config.get("ENV", "dev")

    uvicorn.run(
        app="app.server:app",
        host="0.0.0.0",
        port=int(port),
        reload=True if env == "dev" else False,
    )
