import enum
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.cliente import Cliente
    from app.models.orden_reparacion import OrdenReparacion


class NivelCombustible(str, enum.Enum):
    """Nivel de combustible reportado al momento de ingresar al taller."""
    VACIO = "Vacio"
    RESERVA = "Reserva"
    UN_CUARTO = "1/4"
    MEDIO = "1/2"
    TRES_CUARTOS = "3/4"
    LLENO = "Lleno"


class Vehiculo(Base):
    """
    Modelo ORM de Vehículos (motos, autos, camionetas).
    """
    __tablename__ = "vehiculos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    cliente_id: Mapped[int] = mapped_column(
        ForeignKey("clientes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    marca: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    modelo: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    placa: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    vin: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True, index=True)
    kilometraje_actual: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    nivel_combustible: Mapped[NivelCombustible] = mapped_column(
        SQLEnum(NivelCombustible, name="nivel_combustible_enum"),
        nullable=False,
        default=NivelCombustible.MEDIO,
        server_default=NivelCombustible.MEDIO.value,
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
    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="vehiculos")
    ordenes_reparacion: Mapped[List["OrdenReparacion"]] = relationship(
        "OrdenReparacion",
        back_populates="vehiculo",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Vehiculo(id={self.id}, placa='{self.placa}', marca='{self.marca}', modelo='{self.modelo}')>"

