from fastapi import APIRouter
from app.api.v1.endpoints import clientes, vehiculos, ordenes, bahias, camaras, dvi, presupuestos, auth

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Autenticación y Usuarios"],
)

api_router.include_router(
    clientes.router,
    prefix="/clientes",
    tags=["Clientes"],
)

api_router.include_router(
    vehiculos.router,
    prefix="/vehiculos",
    tags=["Vehículos"],
)

api_router.include_router(
    ordenes.router,
    prefix="/ordenes-reparacion",
    tags=["Órdenes de Reparación"],
)

api_router.include_router(
    ordenes.router,
    prefix="/ordenes",
    tags=["Órdenes de Reparación"],
    include_in_schema=False,
)

api_router.include_router(
    bahias.router,
    prefix="/bahias",
    tags=["Bahías de Trabajo"],
)

api_router.include_router(
    camaras.router,
    prefix="/camaras",
    tags=["Cámaras y Streaming"],
)

api_router.include_router(
    dvi.router,
    prefix="/dvi",
    tags=["Inspección Digital (DVI)"],
)

api_router.include_router(
    presupuestos.router,
    prefix="/presupuestos",
    tags=["Presupuestos y Pagos"],
)
