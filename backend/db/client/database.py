import os
from sqlmodel import SQLModel, create_engine

sqlite_url = os.getenv("DATABASE_URI", "sqlite:///database.db")
engine = create_engine(sqlite_url)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
