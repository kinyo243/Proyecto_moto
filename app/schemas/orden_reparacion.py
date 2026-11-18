from datetime import datetime
from typing import Optional, TYPE_CHECKING
from pydantic import BaseModel, ConfigDict, Field, computed_field
from app.models.orden_reparacion import EstadoOrden

if TYPE_CHECKING:
    from app.schemas.cliente import ClienteResponse
    from app.schemas.vehiculo import VehiculoWithClienteResponse


class OrdenReparacionBase(BaseModel):
    vehiculo_id: int = Field(..., gt=0, description="ID del vehículo a reparar")
    bahia_id: Optional[int] = Field(None, gt=0, description="ID de la bahía asignada")
    estado: EstadoOrden = Field(default=EstadoOrden.EN_ESPERA, description="Estado del flujo de la orden")
    notas_recepcion: Optional[str] = Field(None, description="Fallas reportadas por el cliente, observaciones iniciales")


class OrdenReparacionCreate(BaseModel):
    """Esquema de entrada al momento de ingresar el vehículo al taller (Recepción)."""
    vehiculo_id: int = Field(..., gt=0, description="ID del vehículo a ingresar")
    bahia_id: Optional[int] = Field(None, gt=0, description="ID de la bahía donde se ubica inicialmente")
    notas_recepcion: Optional[str] = Field(None, description="Motivo de ingreso, síntomas, pertenencias dejadas")
    estado: EstadoOrden = Field(
        default=EstadoOrden.EN_ESPERA,
        description="Estado inicial de la orden (por defecto En Espera)"
    )


class OrdenReparacionUpdate(BaseModel):
    """Esquema para actualización general de la orden de reparación."""
    bahia_id: Optional[int] = Field(None, gt=0)
    estado: Optional[EstadoOrden] = None
    notas_recepcion: Optional[str] = None


class OrdenReparacionStatusUpdate(BaseModel):
    """Esquema puntual para transicionar de estado en el flujo operativo del taller."""
    estado: EstadoOrden = Field(..., description="Nuevo estado de la orden de reparación")


class OrdenReparacionResponse(OrdenReparacionBase):
    """DTO básico para respuesta de orden de reparación."""
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    model_config = ConfigDict(from_attributes=True)


class OrdenReparacionDetailResponse(OrdenReparacionResponse):
    """DTO completo que incluye vehículo y cliente asociado."""
    vehiculo: Optional["VehiculoWithClienteResponse"] = None

    @computed_field
    @property
    def cliente(self) -> Optional["ClienteResponse"]:
        """Acceso directo al cliente propietario para facilitar consumo en frontend."""
        if self.vehiculo and getattr(self.vehiculo, "cliente", None):
            return self.vehiculo.cliente
        return None

    model_config = ConfigDict(from_attributes=True)
