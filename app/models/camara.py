import enum
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.bahia import Bahia


class EstadoCamara(str, enum.Enum):
    """Estado operativo de la cámara IP."""
    ACTIVA = "Activa"
    INACTIVA = "Inactiva"
    EN_FALLA = "En Falla"


class Camara(Base):
    """
    Modelo ORM de Cámaras IP instaladas en las bahías de trabajo del taller.
    """
    __tablename__ = "camaras"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    bahia_id: Mapped[int] = mapped_column(
        ForeignKey("bahias.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    url_rtsp: Mapped[str] = mapped_column(String(255), nullable=False)
    estado: Mapped[EstadoCamara] = mapped_column(
        SQLEnum(EstadoCamara, name="estado_camara_enum"),
        nullable=False,
        default=EstadoCamara.ACTIVA,
        server_default=EstadoCamara.ACTIVA.value,
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

    # Relación N a 1: Pertenece a una bahía específica
    bahia: Mapped["Bahia"] = relationship("Bahia", back_populates="camaras")

    @property
    def stream_name(self) -> str:
        """Identificador de stream para MediaMTX / go2rtc (ej. bahia_1_cam_2)."""
        return f"bahia_{self.bahia_id}_cam_{self.id}"

    def __repr__(self) -> str:
        return f"<Camara(id={self.id}, bahia_id={self.bahia_id}, estado='{self.estado}')>"

