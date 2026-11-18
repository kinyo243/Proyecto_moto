from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from app.models.cliente import TipoCliente

if TYPE_CHECKING:
    from app.schemas.vehiculo import VehiculoResponse


class ClienteBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=150, description="Nombre completo o razón social")
    telefono: str = Field(..., min_length=7, max_length=30, description="Teléfono principal de contacto")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico válido")
    direccion: Optional[str] = Field(None, max_length=255, description="Dirección física o de facturación")
    tipo: TipoCliente = Field(default=TipoCliente.REGULAR, description="Tipo de cliente (regular o flotilla)")

    @field_validator("nombre", "telefono")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()


class ClienteCreate(ClienteBase):
    """Esquema de entrada para registrar un nuevo cliente."""
    pass


class ClienteSearch(BaseModel):
    """Esquema de búsqueda rápida para recepción de taller."""
    query: Optional[str] = Field(None, description="Término de búsqueda general (nombre, teléfono o email)")
    telefono: Optional[str] = Field(None, description="Búsqueda por teléfono")
    email: Optional[str] = Field(None, description="Búsqueda por correo")


class ClienteUpdate(BaseModel):
    """Esquema para actualización parcial (PATCH) o completa (PUT)."""
    nombre: Optional[str] = Field(None, min_length=2, max_length=150)
    telefono: Optional[str] = Field(None, min_length=7, max_length=30)
    email: Optional[EmailStr] = None
    direccion: Optional[str] = Field(None, max_length=255)
    tipo: Optional[TipoCliente] = None


class ClienteResponse(ClienteBase):
    """DTO para respuesta de datos de cliente."""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClienteDetailResponse(ClienteResponse):
    """DTO extendido que incluye la lista de vehículos del cliente."""
    vehiculos: List["VehiculoResponse"] = []

    model_config = ConfigDict(from_attributes=True)
