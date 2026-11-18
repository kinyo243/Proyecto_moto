import enum
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.orden_reparacion import OrdenReparacion


class EstadoDVI(str, enum.Enum):
    """Semáforo de estado técnico para ítems de inspección."""
    VERDE = "Verde"        # Buen estado / OK
    AMARILLO = "Amarillo"  # Atención / Próximo reemplazo o servicio
    ROJO = "Rojo"          # Urgente / Requiere intervención o cambio inmediato


class EstadoAprobacion(str, enum.Enum):
    """Estado de aprobación del presupuesto/inspección por parte del cliente."""
    PENDIENTE = "Pendiente"
    APROBADO = "Aprobado"
    RECHAZADO = "Rechazado"


class TipoEvidenciaDVI(str, enum.Enum):
    """Tipo de medio multimedia adjunto al ítem evaluado."""
    FOTO = "foto"
    VIDEO = "video"


class InspeccionDVI(Base):
    """
    Inspección Digital de Vehículo (DVI).
    Agrupa los diagnósticos visuales por componentes, evidencias multimedia
    y la firma digital de aprobación del cliente.
    """
    __tablename__ = "inspecciones_dvi"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("ordenes_reparacion.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    fecha_inspeccion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    tecnico_responsable: Mapped[str | None] = mapped_column(String(150), nullable=True)
    notas_generales: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Firma digital del cliente para aprobación del informe / presupuesto
    firma_cliente: Mapped[str | None] = mapped_column(String(500), nullable=True)
    nombre_firmante: Mapped[str | None] = mapped_column(String(150), nullable=True)
    documento_firmante: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fecha_firma: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    estado_aprobacion: Mapped[EstadoAprobacion] = mapped_column(
        SQLEnum(EstadoAprobacion, name="estado_aprobacion_enum"),
        nullable=False,
        default=EstadoAprobacion.PENDIENTE,
        server_default=EstadoAprobacion.PENDIENTE.value,
        index=True,
    )

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
    orden: Mapped["OrdenReparacion"] = relationship("OrdenReparacion", back_populates="inspeccion_dvi")
    items: Mapped[List["ItemDVI"]] = relationship(
        "ItemDVI",
        back_populates="inspeccion",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ItemDVI.id",
    )

    def __repr__(self) -> str:
        return f"<InspeccionDVI(id={self.id}, orden_id={self.orden_id}, estado_aprobacion='{self.estado_aprobacion}')>"


class ItemDVI(Base):
    """
    Ítem específico evaluado dentro de la plantilla del DVI
    (ej. Frenos, Neumáticos, Fluidos, Suspensión).
    """
    __tablename__ = "items_dvi"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    inspeccion_id: Mapped[int] = mapped_column(
        ForeignKey("inspecciones_dvi.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    categoria: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    nombre_item: Mapped[str] = mapped_column(String(150), nullable=False)
    estado: Mapped[EstadoDVI] = mapped_column(
        SQLEnum(EstadoDVI, name="estado_dvi_enum"),
        nullable=False,
        default=EstadoDVI.VERDE,
        server_default=EstadoDVI.VERDE.value,
    )
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relaciones
    inspeccion: Mapped["InspeccionDVI"] = relationship("InspeccionDVI", back_populates="items")
    evidencias: Mapped[List["EvidenciaItemDVI"]] = relationship(
        "EvidenciaItemDVI",
        back_populates="item",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ItemDVI(id={self.id}, categoria='{self.categoria}', item='{self.nombre_item}', estado='{self.estado}')>"


class EvidenciaItemDVI(Base):
    """
    Archivos multimedia (fotografías o clips de video cortos) de evidencia
    adjuntos a un ítem evaluado del DVI.
    """
    __tablename__ = "evidencias_item_dvi"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    item_dvi_id: Mapped[int] = mapped_column(
        ForeignKey("items_dvi.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tipo_archivo: Mapped[TipoEvidenciaDVI] = mapped_column(
        SQLEnum(TipoEvidenciaDVI, name="tipo_evidencia_dvi_enum"),
        nullable=False,
        default=TipoEvidenciaDVI.FOTO,
        server_default=TipoEvidenciaDVI.FOTO.value,
    )
    archivo_path: Mapped[str] = mapped_column(String(500), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relación
    item: Mapped["ItemDVI"] = relationship("ItemDVI", back_populates="evidencias")

    def __repr__(self) -> str:
        return f"<EvidenciaItemDVI(id={self.id}, tipo='{self.tipo_archivo}', path='{self.archivo_path}')>"

