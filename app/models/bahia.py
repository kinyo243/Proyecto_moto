from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.camara import Camara
    from app.models.orden_reparacion import OrdenReparacion


class Bahia(Base):
    """
    Modelo ORM de Bahías de Trabajo (puestos de trabajo, elevadores, áreas de diagnóstico).
    """
    __tablename__ = "bahias"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    nombre_bahia: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    descripcion: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relación 1 a N: Una bahía puede tener una o varias cámaras (ej. frontal y lateral)
    camaras: Mapped[List["Camara"]] = relationship(
        "Camara",
        back_populates="bahia",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    # Relación 1 a N: Órdenes de reparación asignadas a esta bahía
    ordenes: Mapped[List["OrdenReparacion"]] = relationship(
        "OrdenReparacion",
        back_populates="bahia",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Bahia(id={self.id}, nombre='{self.nombre_bahia}')>"

