from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from app.services.bcv_service import fetch_tasas_bcv

router = APIRouter()


class TasasBCVResponse(BaseModel):
    fuente: str
    url: str
    usd: float
    eur: float
    fecha_valor: Optional[str] = None
    consultado_en: str
    cached: bool = False
    antiguedad_segundos: Optional[int] = None
    aviso: Optional[str] = None


@router.get(
    "/tasas",
    response_model=TasasBCVResponse,
    summary="Obtener tasas oficiales vigentes del Banco Central de Venezuela (USD y EUR)",
)
def get_tasas_bcv(
    force_refresh: bool = Query(
        False,
        description="Fuerza una nueva petición web al portal del BCV ignorando el caché en memoria de 10 minutos.",
    ),
):
    """
    Scraper oficial del Banco Central de Venezuela (BCV).
    Extrae en tiempo real el valor del Dólar estadounidense (USD) y del Euro (EUR)
    expresados en Bolívares (Bs / VES) y la 'Fecha Valor' oficial.
    """
    try:
        data = fetch_tasas_bcv(force_refresh=force_refresh)
        return data
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"No se pudo consultar el portal del BCV: {str(exc)}",
        )

