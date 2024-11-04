import os
from typing import Generic, TypeVar
from sqlmodel import SQLModel, Session, create_engine, select

sqlite_url = os.getenv("DATABASE_URI", "sqlite:///database.db")
engine = create_engine(sqlite_url)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


DBType = TypeVar("DBType", bound=SQLModel)
DBCreateType = TypeVar("DBCreateType", bound=SQLModel)
DBPublicType = TypeVar("DBPublicType", bound=SQLModel)


class DatabaseClient(Generic[DBType, DBCreateType, DBPublicType]):
    def __enter__(self):
        self._session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._session.close()
