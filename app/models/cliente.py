import enum
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.vehiculo import Vehiculo


class TipoCliente(str, enum.Enum):
    """Categoría comercial del cliente para precios, facturación o prioridades."""
    REGULAR = "regular"
    FLOTILLA = "flotilla"


class Cliente(Base):
    """
    Modelo ORM de Clientes del taller automotriz/motos.
    """
    __tablename__ = "clientes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    telefono: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    direccion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tipo: Mapped[TipoCliente] = mapped_column(
        SQLEnum(TipoCliente, name="tipo_cliente_enum"),
        nullable=False,
        default=TipoCliente.REGULAR,
        server_default=TipoCliente.REGULAR.value,
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

    # Relación 1 a N: Un cliente tiene múltiples vehículos asociados
    vehiculos: Mapped[List["Vehiculo"]] = relationship(
        "Vehiculo",
        back_populates="cliente",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Cliente(id={self.id}, nombre='{self.nombre}', tipo='{self.tipo}')>"

