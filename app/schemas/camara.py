from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, computed_field
from app.models.camara import EstadoCamara


class CamaraBase(BaseModel):
    bahia_id: int = Field(..., gt=0, description="ID de la bahía de trabajo donde está montada")
    url_rtsp: str = Field(..., min_length=7, max_length=255, description="URL RTSP de la cámara IP (ej. rtsp://admin:pass@192.168.1.100:554/stream1)")
    estado: EstadoCamara = Field(default=EstadoCamara.ACTIVA, description="Estado operativo de la cámara")

    @field_validator("url_rtsp")
    @classmethod
    def validate_rtsp_url(cls, v: str) -> str:
        v = v.strip()
        if not (v.startswith("rtsp://") or v.startswith("rtsps://")):
            raise ValueError("La URL de la cámara debe iniciar con el protocolo 'rtsp://' o 'rtsps://'")
        return v


class CamaraCreate(CamaraBase):
    """Esquema de entrada para registrar una cámara IP."""
    pass


class CamaraUpdate(BaseModel):
    """Esquema para actualizar datos de la cámara."""
    bahia_id: Optional[int] = Field(None, gt=0)
    url_rtsp: Optional[str] = Field(None, min_length=7, max_length=255)
    estado: Optional[EstadoCamara] = None

    @field_validator("url_rtsp")
    @classmethod
    def validate_rtsp_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if not (v.startswith("rtsp://") or v.startswith("rtsps://")):
                raise ValueError("La URL debe iniciar con 'rtsp://' o 'rtsps://'")
            return v
        return v


class CamaraResponse(CamaraBase):
    """DTO para respuesta de datos de cámara."""
    id: int
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def stream_name(self) -> str:
        """Nombre del stream utilizado en el Gateway MediaMTX / go2rtc."""
        return f"bahia_{self.bahia_id}_cam_{self.id}"

    @computed_field
    @property
    def webrtc_whep_url(self) -> str:
        """URL WebRTC WHEP para streaming de ultra baja latencia (<500ms)."""
        return f"/mediamtx/{self.stream_name}/whep"

    @computed_field
    @property
    def hls_url(self) -> str:
        """URL de fallback HLS para navegadores tradicionales."""
        return f"/mediamtx/{self.stream_name}/index.m3u8"

    model_config = ConfigDict(from_attributes=True)

