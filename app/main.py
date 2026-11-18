from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Ciclo de vida de la aplicación.
    Verifica la conectividad con la base de datos al iniciar el servicio.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        print(f"[Lifespan WARNING] No se pudo verificar conexión inmediata a DB: {exc}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "API Backend para Software de Gestión de Taller Automotriz y Motos (PMV).\n\n"
        "Módulos principales:\n"
        "- **Clientes**: Gestión y búsqueda de propietarios (particulares y flotillas).\n"
        "- **Vehículos**: Registro, asociación a clientes, odómetro y combustible de ingreso.\n"
        "- **Órdenes de Reparación**: Flujo de recepción, diagnóstico, reparación y entrega."
    ),
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configuración de CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get(
    "/health",
    status_code=status.HTTP_200_OK,
    tags=["Salud del Sistema"],
    summary="Verificar estado de salud de la API",
)
def health_check():
    """
    Endpoint de monitoreo y healthcheck (Kubernetes, Docker, Cloud Load Balancers).
    """
    db_status = "ok"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
    }


@app.get(
    "/",
    tags=["General"],
    summary="Información raíz del servicio",
)
def root():
    return {
        "message": f"Bienvenido a {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "api_v1": settings.API_V1_PREFIX,
    }


# Montar enrutador oficial v1
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Montar enrutador en raíz para soportar rutas directas (/clientes, /vehiculos, /ordenes-reparacion)
app.include_router(api_router, include_in_schema=False)
