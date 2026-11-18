from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.models.bahia import Bahia
from app.models.camara import Camara, EstadoCamara
from app.schemas.camara import (
    CamaraCreate,
    CamaraUpdate,
    CamaraResponse,
)

router = APIRouter()


@router.post(
    "",
    response_model=CamaraResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar una nueva cámara y asociarla a una bahía",
)
def create_camara(
    payload: CamaraCreate,
    db: Session = Depends(get_db),
):
    """
    Registra una cámara IP en el sistema especificando su flujo RTSP y asociándola
    a una bahía de trabajo física dentro del taller.
    """
    # 1. Validar existencia de la bahía de trabajo
    bahia = db.get(Bahia, payload.bahia_id)
    if not bahia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se puede registrar la cámara: La bahía con ID {payload.bahia_id} no existe.",
        )

    # 2. Registrar la cámara
    nueva_camara = Camara(**payload.model_dump())
    db.add(nueva_camara)
    db.commit()
    db.refresh(nueva_camara)
    return nueva_camara


@router.get(
    "",
    response_model=List[CamaraResponse],
    summary="Listar cámaras IP del taller con filtros",
)
def list_camaras(
    bahia_id: Optional[int] = Query(None, description="Filtrar por bahía de trabajo"),
    estado: Optional[EstadoCamara] = Query(None, description="Filtrar por estado operativo"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = select(Camara)

    if bahia_id:
        query = query.where(Camara.bahia_id == bahia_id)

    if estado:
        query = query.where(Camara.estado == estado)

    query = query.order_by(Camara.id.asc()).offset(skip).limit(limit)
    return db.execute(query).scalars().all()


@router.get(
    "/{camara_id}",
    response_model=CamaraResponse,
    summary="Obtener detalle y URLs de streaming de una cámara",
)
def get_camara(
    camara_id: int,
    db: Session = Depends(get_db),
):
    camara = db.get(Camara, camara_id)
    if not camara:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cámara con ID {camara_id} no encontrada.",
        )
    return camara


@router.patch(
    "/{camara_id}/estado",
    response_model=CamaraResponse,
    summary="Actualizar estado operativo de una cámara (Activa/Inactiva/Falla)",
)
def update_camara_estado(
    camara_id: int,
    nuevo_estado: EstadoCamara = Query(..., description="Nuevo estado operativo"),
    db: Session = Depends(get_db),
):
    camara = db.get(Camara, camara_id)
    if not camara:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cámara con ID {camara_id} no encontrada.",
        )

    camara.estado = nuevo_estado
    db.commit()
    db.refresh(camara)
    return camara


@router.delete(
    "/{camara_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar o desvincular cámara",
)
def delete_camara(
    camara_id: int,
    db: Session = Depends(get_db),
):
    camara = db.get(Camara, camara_id)
    if not camara:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cámara con ID {camara_id} no encontrada.",
        )

    db.delete(camara)
    db.commit()
    return None

