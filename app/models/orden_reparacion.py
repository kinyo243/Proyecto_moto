import enum
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import Text, Integer, ForeignKey, DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.vehiculo import Vehiculo
    from app.models.bahia import Bahia
    from app.models.evidencia import EvidenciaInspeccion
    from app.models.dvi import InspeccionDVI
    from app.models.presupuesto import Presupuesto, Pago


class EstadoOrden(str, enum.Enum):
    """Flujo de estados de una Orden de Reparación (OR)."""
    EN_ESPERA = "En Espera"
    EN_DIAGNOSTICO = "En Diagnóstico"
    EN_REPARACION = "En Reparación"
    LISTO = "Listo"
    ENTREGADO = "Entregado"


class OrdenReparacion(Base):
    """
    Modelo ORM de Órdenes de Reparación (OR).
    Representa el servicio técnico y el ciclo de vida del vehículo dentro del taller.
    """
    __tablename__ = "ordenes_reparacion"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    vehiculo_id: Mapped[int] = mapped_column(
        ForeignKey("vehiculos.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    bahia_id: Mapped[int | None] = mapped_column(
        ForeignKey("bahias.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    estado: Mapped[EstadoOrden] = mapped_column(
        SQLEnum(EstadoOrden, name="estado_orden_enum"),
        nullable=False,
        default=EstadoOrden.EN_ESPERA,
        server_default=EstadoOrden.EN_ESPERA.value,
        index=True,
    )
    notas_recepcion: Mapped[str | None] = mapped_column(Text, nullable=True)

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    fecha_actualizacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relaciones
    vehiculo: Mapped["Vehiculo"] = relationship(
        "Vehiculo",
        back_populates="ordenes_reparacion",
    )
    bahia: Mapped["Bahia | None"] = relationship(
        "Bahia",
        back_populates="ordenes",
    )
    evidencias: Mapped[List["EvidenciaInspeccion"]] = relationship(
        "EvidenciaInspeccion",
        back_populates="orden",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    inspeccion_dvi: Mapped["InspeccionDVI | None"] = relationship(
        "InspeccionDVI",
        back_populates="orden",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    presupuesto: Mapped["Presupuesto | None"] = relationship(
        "Presupuesto",
        back_populates="orden",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    pagos: Mapped[List["Pago"]] = relationship(
        "Pago",
        back_populates="orden",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<OrdenReparacion(id={self.id}, vehiculo_id={self.vehiculo_id}, estado='{self.estado}')>"
