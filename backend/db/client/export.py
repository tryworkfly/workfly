from fastapi import HTTPException
from sqlmodel import Session, select
from typing import Iterable
import uuid

from ..model.export import Export, ExportCreate, ExportPublic
from .database import engine


class ExportClient:
    def __enter__(self):
        self._session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._session.close()

    def create(self, workflow_create: ExportCreate) -> ExportPublic:
        export = Export.model_validate(workflow_create)
        self._session.add(export)
        self._session.commit()
        self._session.refresh(export)
        return ExportPublic.model_validate(export)

    def put(self, export_id: uuid.UUID, export_update: ExportCreate) -> ExportPublic:
        statement = select(Export).where(Export.id == export_id)
        export = self._session.exec(statement).first()
        if export is None:
            raise HTTPException(status_code=404, detail="Export not found")

        export.sqlmodel_update(export_update.model_dump())
        self._session.add(export)
        self._session.commit()
        self._session.refresh(export)

        return ExportPublic.model_validate(export)

    def get_all(self) -> Iterable[ExportPublic]:
        statement = select(Export)
        exports = self._session.exec(statement)
        return [ExportPublic.model_validate(export) for export in exports]

    def get_all_by_workflow_id(self, workflow_id: uuid.UUID) -> Iterable[ExportPublic]:
        statement = select(Export).where(Export.workflow_id == workflow_id)
        exports = self._session.exec(statement)
        return [ExportPublic.model_validate(export) for export in exports]

    def get(self, export_id: uuid.UUID) -> ExportPublic | None:
        statement = select(Export).where(Export.id == export_id)
        export = self._session.exec(statement).first()
        return ExportPublic.model_validate(export) if export is not None else None
