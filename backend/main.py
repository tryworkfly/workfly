import os
import uvicorn
import dotenv


if __name__ == "__main__":
    dotenv.load_dotenv()
    port = os.getenv("PORT") or 8000
    env = os.getenv("ENV", "production")

    uvicorn.run(
        app="app.server:app",
        host="0.0.0.0",
        port=int(port),
        reload=True if env == "dev" else False,
    )
