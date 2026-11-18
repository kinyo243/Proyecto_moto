from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.dvi import EstadoDVI, EstadoAprobacion, TipoEvidenciaDVI


class EvidenciaItemDVICreate(BaseModel):
    """Esquema de entrada para adjuntar evidencia multimedia a un ítem del DVI."""
    tipo_archivo: TipoEvidenciaDVI = Field(default=TipoEvidenciaDVI.FOTO, description="foto o video")
    archivo_base64: Optional[str] = Field(None, description="Contenido en base64 si se envía directamente")
    descripcion: Optional[str] = Field(None, max_length=255, description="Descripción técnica de la evidencia")


class EvidenciaItemDVIResponse(BaseModel):
    id: int
    item_dvi_id: int
    tipo_archivo: TipoEvidenciaDVI
    archivo_path: str
    descripcion: Optional[str]
    fecha_creacion: datetime

    model_config = ConfigDict(from_attributes=True)


class ItemDVICreate(BaseModel):
    """Esquema para crear o actualizar un ítem del DVI."""
    categoria: str = Field(..., min_length=2, max_length=100, description="Frenos, Neumáticos, Fluidos, Suspensión, etc.")
    nombre_item: str = Field(..., min_length=2, max_length=150, description="Nombre del componente")
    estado: EstadoDVI = Field(default=EstadoDVI.VERDE, description="Semáforo técnico: Verde, Amarillo o Rojo")
    observaciones: Optional[str] = Field(None, description="Hallazgo técnico u observaciones")


class ItemDVIUpdate(BaseModel):
    """Esquema para actualizar el estado técnico de un ítem existente."""
    estado: Optional[EstadoDVI] = None
    observaciones: Optional[str] = None


class ItemDVIResponse(BaseModel):
    id: int
    inspeccion_id: int
    categoria: str
    nombre_item: str
    estado: EstadoDVI
    observaciones: Optional[str]
    evidencias: List[EvidenciaItemDVIResponse] = []

    model_config = ConfigDict(from_attributes=True)


class InspeccionDVICreate(BaseModel):
    """Esquema para inicializar el DVI de una orden de reparación."""
    orden_id: int = Field(..., gt=0, description="ID de la orden de reparación")
    tecnico_responsable: Optional[str] = Field(None, max_length=150, description="Nombre del mecánico inspector")
    notas_generales: Optional[str] = Field(None, description="Resumen general del estado del vehículo")
    usar_plantilla_esencial: bool = Field(
        default=True,
        description="Si es True, inicializa automáticamente los ítems estándar: Frenos, Neumáticos, Fluidos y Suspensión",
    )
    items_personalizados: Optional[List[ItemDVICreate]] = Field(
        None,
        description="Lista opcional de ítems personalizados adicionales a la plantilla",
    )


class FirmaClientePayload(BaseModel):
    """Payload para registrar la firma digital del cliente y su aprobación."""
    firma_base64: str = Field(..., description="Firma capturada en canvas (data:image/png;base64,...)")
    nombre_firmante: str = Field(..., min_length=2, max_length=150, description="Nombre de quien aprueba")
    documento_firmante: Optional[str] = Field(None, max_length=50, description="C.I. / DNI / Pasaporte del firmante")
    aprobado: bool = Field(default=True, description="True para aprobar el presupuesto/DVI, False para rechazar")
    notas: Optional[str] = Field(None, description="Observaciones del cliente sobre la aprobación")


class InspeccionDVIResponse(BaseModel):
    id: int
    orden_id: int
    fecha_inspeccion: datetime
    tecnico_responsable: Optional[str]
    notas_generales: Optional[str]
    firma_cliente: Optional[str]
    nombre_firmante: Optional[str]
    documento_firmante: Optional[str]
    fecha_firma: Optional[datetime]
    estado_aprobacion: EstadoAprobacion
    items: List[ItemDVIResponse] = []

    model_config = ConfigDict(from_attributes=True)

