from app.models.cliente import TipoCliente
from app.models.vehiculo import NivelCombustible
from app.models.orden_reparacion import EstadoOrden
from app.models.camara import EstadoCamara
from app.models.dvi import EstadoDVI, EstadoAprobacion, TipoEvidenciaDVI

from app.schemas.cliente import (
    ClienteBase,
    ClienteCreate,
    ClienteSearch,
    ClienteUpdate,
    ClienteResponse,
    ClienteDetailResponse,
)
from app.schemas.vehiculo import (
    VehiculoBase,
    VehiculoCreate,
    VehiculoUpdate,
    VehiculoResponse,
    VehiculoWithClienteResponse,
    VehiculoDetailResponse,
)
from app.schemas.orden_reparacion import (
    OrdenReparacionBase,
    OrdenReparacionCreate,
    OrdenReparacionUpdate,
    OrdenReparacionStatusUpdate,
    OrdenReparacionResponse,
    OrdenReparacionDetailResponse,
)
from app.schemas.bahia import (
    BahiaBase,
    BahiaCreate,
    BahiaUpdate,
    BahiaResponse,
    BahiaDetailResponse,
)
from app.schemas.camara import (
    CamaraBase,
    CamaraCreate,
    CamaraUpdate,
    CamaraResponse,
)
from app.schemas.evidencia import (
    EvidenciaCapturaPayload,
    EvidenciaResponse,
)
from app.schemas.dvi import (
    EvidenciaItemDVICreate,
    EvidenciaItemDVIResponse,
    ItemDVICreate,
    ItemDVIUpdate,
    ItemDVIResponse,
    InspeccionDVICreate,
    FirmaClientePayload,
    InspeccionDVIResponse,
)

# Reconstruir modelos con referencias adelantadas (ForwardRef)
ClienteDetailResponse.model_rebuild()
VehiculoWithClienteResponse.model_rebuild()
VehiculoDetailResponse.model_rebuild()
OrdenReparacionDetailResponse.model_rebuild()
BahiaDetailResponse.model_rebuild()
ItemDVIResponse.model_rebuild()
InspeccionDVIResponse.model_rebuild()

__all__ = [
    "TipoCliente",
    "NivelCombustible",
    "EstadoOrden",
    "EstadoCamara",
    "EstadoDVI",
    "EstadoAprobacion",
    "TipoEvidenciaDVI",
    "ClienteBase",
    "ClienteCreate",
    "ClienteSearch",
    "ClienteUpdate",
    "ClienteResponse",
    "ClienteDetailResponse",
    "VehiculoBase",
    "VehiculoCreate",
    "VehiculoUpdate",
    "VehiculoResponse",
    "VehiculoWithClienteResponse",
    "VehiculoDetailResponse",
    "OrdenReparacionBase",
    "OrdenReparacionCreate",
    "OrdenReparacionUpdate",
    "OrdenReparacionStatusUpdate",
    "OrdenReparacionResponse",
    "OrdenReparacionDetailResponse",
    "BahiaBase",
    "BahiaCreate",
    "BahiaUpdate",
    "BahiaResponse",
    "BahiaDetailResponse",
    "CamaraBase",
    "CamaraCreate",
    "CamaraUpdate",
    "CamaraResponse",
    "EvidenciaCapturaPayload",
    "EvidenciaResponse",
    "EvidenciaItemDVICreate",
    "EvidenciaItemDVIResponse",
    "ItemDVICreate",
    "ItemDVIUpdate",
    "ItemDVIResponse",
    "InspeccionDVICreate",
    "FirmaClientePayload",
    "InspeccionDVIResponse",
]
