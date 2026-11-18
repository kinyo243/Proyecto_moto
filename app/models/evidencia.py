from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.orden_reparacion import OrdenReparacion
    from app.models.camara import Camara


class EvidenciaInspeccion(Base):
    """
    Registro fotográfico de evidencia técnica/inspección capturado desde las cámaras
    y asociado a una Orden de Reparación activa en la bahía.
    """
    __tablename__ = "evidencias_inspeccion"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(
        ForeignKey("ordenes_reparacion.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    camara_id: Mapped[int | None] = mapped_column(
        ForeignKey("camaras.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    archivo_path: Mapped[str] = mapped_column(String(500), nullable=False)
    notas: Mapped[str | None] = mapped_column(Text, nullable=True)

    fecha_captura: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relaciones
    orden: Mapped["OrdenReparacion"] = relationship("OrdenReparacion", back_populates="evidencias")
    camara: Mapped["Camara | None"] = relationship("Camara")

    def __repr__(self) -> str:
        return f"<EvidenciaInspeccion(id={self.id}, orden_id={self.orden_id}, archivo='{self.archivo_path}')>"

