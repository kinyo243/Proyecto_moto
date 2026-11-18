import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class RolUsuario(str, enum.Enum):
    ADMINISTRADOR = "administrador"
    RECEPCIONISTA = "recepcionista"
    MECANICO = "mecanico"


class Usuario(Base):
    """
    Modelo de Usuario para autenticación y control de acceso (RBAC).
    """
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    nombre_completo: Mapped[str] = mapped_column(String(150), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[RolUsuario] = mapped_column(
        SQLEnum(RolUsuario, name="rol_usuario_enum"),
        nullable=False,
        default=RolUsuario.RECEPCIONISTA,
        server_default=RolUsuario.RECEPCIONISTA.value,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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

