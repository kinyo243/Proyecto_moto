from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class EvidenciaCapturaPayload(BaseModel):
    """Payload para adjuntar foto tomada desde el streaming."""
    camara_id: Optional[int] = Field(None, description="ID de la cámara de donde se tomó el fotograma")
    imagen_base64: str = Field(..., description="Fotograma capturado en formato data:image/jpeg;base64,... o base64 puro")
    notas: Optional[str] = Field(None, max_length=500, description="Observaciones técnicas de la inspección")


class EvidenciaResponse(BaseModel):
    """DTO para respuesta de evidencia guardada."""
    id: int
    orden_id: int
    camara_id: Optional[int]
    archivo_path: str
    notas: Optional[str]
    fecha_captura: datetime

    model_config = ConfigDict(from_attributes=True)

