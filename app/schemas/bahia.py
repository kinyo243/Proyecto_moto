from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from pydantic import BaseModel, ConfigDict, Field

if TYPE_CHECKING:
    from app.schemas.camara import CamaraResponse
    from app.schemas.orden_reparacion import OrdenReparacionResponse


class BahiaBase(BaseModel):
    nombre_bahia: str = Field(..., min_length=2, max_length=100, description="Nombre o identificador de la bahía (ej. Bahía 1 - Elevador Principal)")
    descripcion: Optional[str] = Field(None, max_length=255, description="Descripción técnica o equipamiento de la bahía")


class BahiaCreate(BahiaBase):
    """Esquema para dar de alta una nueva bahía de trabajo."""
    pass


class BahiaUpdate(BaseModel):
    """Esquema para actualizar información de una bahía."""
    nombre_bahia: Optional[str] = Field(None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)


class BahiaResponse(BahiaBase):
    """DTO para respuesta básica de Bahía."""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BahiaDetailResponse(BahiaResponse):
    """DTO detallado que incluye cámaras instaladas y la orden activa en ejecución."""
    camaras: List["CamaraResponse"] = []
    orden_activa: Optional["OrdenReparacionResponse"] = None

    model_config = ConfigDict(from_attributes=True)

