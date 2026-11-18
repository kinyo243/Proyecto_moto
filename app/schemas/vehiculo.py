from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.vehiculo import NivelCombustible

if TYPE_CHECKING:
    from app.schemas.cliente import ClienteResponse
    from app.schemas.orden_reparacion import OrdenReparacionResponse


class VehiculoBase(BaseModel):
    cliente_id: int = Field(..., gt=0, description="ID del cliente propietario")
    marca: str = Field(..., min_length=1, max_length=100, description="Marca (ej. Yamaha, Honda, Suzuki, Toyota)")
    modelo: str = Field(..., min_length=1, max_length=100, description="Modelo (ej. MT-07, CB190R, YBR 125)")
    anio: int = Field(..., ge=1900, le=2100, description="Año de fabricación")
    placa: str = Field(..., min_length=3, max_length=20, description="Placa o matrícula única")
    vin: Optional[str] = Field(None, min_length=5, max_length=50, description="Número de Identificación Vehicular (VIN/Chasis)")
    kilometraje_actual: int = Field(default=0, ge=0, description="Kilometraje actual del vehículo")
    nivel_combustible: NivelCombustible = Field(
        default=NivelCombustible.MEDIO,
        description="Nivel de combustible registrado en recepción"
    )

    @field_validator("placa")
    @classmethod
    def normalize_placa(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("vin")
    @classmethod
    def normalize_vin(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return v.strip().upper()
        return v


class VehiculoCreate(VehiculoBase):
    """Esquema de entrada para registrar o asociar un vehículo a un cliente."""
    pass


class VehiculoUpdate(BaseModel):
    """Esquema de actualización para datos del vehículo."""
    cliente_id: Optional[int] = Field(None, gt=0)
    marca: Optional[str] = Field(None, min_length=1, max_length=100)
    modelo: Optional[str] = Field(None, min_length=1, max_length=100)
    anio: Optional[int] = Field(None, ge=1900, le=2100)
    placa: Optional[str] = Field(None, min_length=3, max_length=20)
    vin: Optional[str] = Field(None, min_length=5, max_length=50)
    kilometraje_actual: Optional[int] = Field(None, ge=0)
    nivel_combustible: Optional[NivelCombustible] = None

    @field_validator("placa")
    @classmethod
    def normalize_placa(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().upper() if v else v

    @field_validator("vin")
    @classmethod
    def normalize_vin(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().upper() if v else v


class VehiculoResponse(VehiculoBase):
    """DTO para respuesta de datos de vehículo."""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VehiculoWithClienteResponse(VehiculoResponse):
    """DTO de vehículo que incluye datos del cliente propietario."""
    cliente: Optional["ClienteResponse"] = None

    model_config = ConfigDict(from_attributes=True)


class VehiculoDetailResponse(VehiculoResponse):
    """DTO detallado que incluye datos del cliente y el histórico de órdenes."""
    cliente: Optional["ClienteResponse"] = None
    ordenes_reparacion: List["OrdenReparacionResponse"] = []

    model_config = ConfigDict(from_attributes=True)
