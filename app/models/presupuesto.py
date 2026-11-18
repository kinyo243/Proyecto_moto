import enum
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.orden_reparacion import OrdenReparacion


class EstadoPresupuesto(str, enum.Enum):
    BORRADOR = "Borrador"
    ENVIADO = "Enviado"
    APROBADO = "Aprobado"
    RECHAZADO = "Rechazado"


class TipoItemPresupuesto(str, enum.Enum):
    REPUESTO = "Repuesto"
    MANO_DE_OBRA = "Mano de Obra"
    SERVICIO_EXTERNO = "Servicio Externo"


class MetodoPago(str, enum.Enum):
    EFECTIVO = "Efectivo"
    TRANSFERENCIA = "Transferencia"
    TARJETA_DEBITO = "Tarjeta Débito"
    TARJETA_CREDITO = "Tarjeta Crédito"
    OTRO = "Otro"


class Presupuesto(Base):
    """
    Modelo de Presupuesto / Cotización de una Orden de Reparación.
    """
    __tablename__ = "presupuestos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("ordenes_reparacion.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    estado: Mapped[EstadoPresupuesto] = mapped_column(
        SQLEnum(EstadoPresupuesto, name="estado_presupuesto_enum"),
        nullable=False,
        default=EstadoPresupuesto.BORRADOR,
        server_default=EstadoPresupuesto.BORRADOR.value,
        index=True,
    )
    impuesto_porcentaje: Mapped[float] = mapped_column(Float, default=16.0, nullable=False)
    descuento: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    notas: Mapped[str | None] = mapped_column(String(500), nullable=True)

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

    # Relaciones
    orden: Mapped["OrdenReparacion"] = relationship(
        "OrdenReparacion",
        back_populates="presupuesto",
    )
    items: Mapped[List["ItemPresupuesto"]] = relationship(
        "ItemPresupuesto",
        back_populates="presupuesto",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ItemPresupuesto(Base):
    """
    Ítems desglosados en el presupuesto (repuestos, mano de obra, etc.).
    """
    __tablename__ = "items_presupuesto"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    presupuesto_id: Mapped[int] = mapped_column(
        ForeignKey("presupuestos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tipo: Mapped[TipoItemPresupuesto] = mapped_column(
        SQLEnum(TipoItemPresupuesto, name="tipo_item_presupuesto_enum"),
        nullable=False,
        default=TipoItemPresupuesto.REPUESTO,
        server_default=TipoItemPresupuesto.REPUESTO.value,
    )
    descripcion: Mapped[str] = mapped_column(String(255), nullable=False)
    cantidad: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    precio_unitario: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Relación
    presupuesto: Mapped["Presupuesto"] = relationship(
        "Presupuesto",
        back_populates="items",
    )


class Pago(Base):
    """
    Registro de pagos / abonos realizados a la Orden de Reparación.
    """
    __tablename__ = "pagos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("ordenes_reparacion.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    monto: Mapped[float] = mapped_column(Float, nullable=False)
    metodo_pago: Mapped[MetodoPago] = mapped_column(
        SQLEnum(MetodoPago, name="metodo_pago_enum"),
        nullable=False,
        default=MetodoPago.EFECTIVO,
    )
    referencia: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notas: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fecha_pago: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relación
    orden: Mapped["OrdenReparacion"] = relationship(
        "OrdenReparacion",
        back_populates="pagos",
    )

