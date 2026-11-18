import os
import base64
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.bahia import Bahia
from app.models.camara import Camara, EstadoCamara
from app.models.orden_reparacion import OrdenReparacion, EstadoOrden
from app.models.evidencia import EvidenciaInspeccion
from app.schemas.bahia import (
    BahiaCreate,
    BahiaUpdate,
    BahiaResponse,
    BahiaDetailResponse,
)
from app.schemas.camara import CamaraCreate, CamaraResponse
from app.schemas.orden_reparacion import OrdenReparacionResponse
from app.schemas.evidencia import EvidenciaCapturaPayload, EvidenciaResponse

router = APIRouter()


@router.post(
    "",
    response_model=BahiaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una nueva bahía de trabajo",
)
def create_bahia(
    payload: BahiaCreate,
    db: Session = Depends(get_db),
):
    """
    Crea una bahía física de trabajo en el taller (ej. Bahía 1 - Elevador Principal).
    """
    existing = db.execute(
        select(Bahia).where(Bahia.nombre_bahia.ilike(payload.nombre_bahia.strip()))
    ).scalars().first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una bahía registrada con el nombre '{payload.nombre_bahia}'.",
        )

    nueva_bahia = Bahia(**payload.model_dump())
    db.add(nueva_bahia)
    db.commit()
    db.refresh(nueva_bahia)
    return nueva_bahia


@router.get(
    "",
    response_model=List[BahiaDetailResponse],
    summary="Listar bahías con sus cámaras y orden activa",
)
def list_bahias(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    bahias = db.execute(select(Bahia).order_by(Bahia.id.asc()).offset(skip).limit(limit)).scalars().all()
    resultado = []

    for b in bahias:
        # Buscar orden activa en curso en esta bahía
        orden_activa = db.execute(
            select(OrdenReparacion).where(
                OrdenReparacion.bahia_id == b.id,
                OrdenReparacion.estado.in_([
                    EstadoOrden.EN_ESPERA,
                    EstadoOrden.EN_DIAGNOSTICO,
                    EstadoOrden.EN_REPARACION,
                    EstadoOrden.LISTO,
                ]),
            ).order_by(OrdenReparacion.id.desc())
        ).scalars().first()

        item = BahiaDetailResponse(
            id=b.id,
            nombre_bahia=b.nombre_bahia,
            descripcion=b.descripcion,
            created_at=b.created_at,
            updated_at=b.updated_at,
            camaras=[CamaraResponse.model_validate(c) for c in b.camaras],
            orden_activa=OrdenReparacionResponse.model_validate(orden_activa) if orden_activa else None,
        )
        resultado.append(item)

    return resultado


@router.get(
    "/{bahia_id}",
    response_model=BahiaDetailResponse,
    summary="Obtener detalle de bahía, cámaras y orden activa",
)
def get_bahia(
    bahia_id: int,
    db: Session = Depends(get_db),
):
    bahia = db.get(Bahia, bahia_id)
    if not bahia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bahía con ID {bahia_id} no encontrada.",
        )

    orden_activa = db.execute(
        select(OrdenReparacion).where(
            OrdenReparacion.bahia_id == bahia.id,
            OrdenReparacion.estado.in_([
                EstadoOrden.EN_ESPERA,
                EstadoOrden.EN_DIAGNOSTICO,
                EstadoOrden.EN_REPARACION,
                EstadoOrden.LISTO,
            ]),
        ).order_by(OrdenReparacion.id.desc())
    ).scalars().first()

    return BahiaDetailResponse(
        id=bahia.id,
        nombre_bahia=bahia.nombre_bahia,
        descripcion=bahia.descripcion,
        created_at=bahia.created_at,
        updated_at=bahia.updated_at,
        camaras=[CamaraResponse.model_validate(c) for c in bahia.camaras],
        orden_activa=OrdenReparacionResponse.model_validate(orden_activa) if orden_activa else None,
    )


@router.post(
    "/{bahia_id}/camaras",
    response_model=CamaraResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar cámara asociada directamente a una bahía específica",
)
def create_camara_in_bahia(
    bahia_id: int,
    payload: CamaraCreate,
    db: Session = Depends(get_db),
):
    bahia = db.get(Bahia, bahia_id)
    if not bahia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bahía con ID {bahia_id} no encontrada.",
        )

    # Forzar el bahia_id de la URL
    data = payload.model_dump()
    data["bahia_id"] = bahia_id

    nueva_camara = Camara(**data)
    db.add(nueva_camara)
    db.commit()
    db.refresh(nueva_camara)
    return nueva_camara


@router.post(
    "/{bahia_id}/captura",
    response_model=EvidenciaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tomar foto de inspección y adjuntarla a la Orden de Reparación activa",
)
def capture_inspection_photo(
    bahia_id: int,
    payload: EvidenciaCapturaPayload,
    db: Session = Depends(get_db),
):
    """
    Recibe el fotograma capturado desde el stream de video de la cámara,
    lo decodifica, lo almacena en el servidor y lo asocia automáticamente
    a la Orden de Reparación que se encuentre activa en esa bahía.
    """
    # 1. Validar existencia de la bahía
    bahia = db.get(Bahia, bahia_id)
    if not bahia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bahía con ID {bahia_id} no encontrada.",
        )

    # 2. Localizar la Orden de Reparación activa en la bahía
    orden_activa = db.execute(
        select(OrdenReparacion).where(
            OrdenReparacion.bahia_id == bahia_id,
            OrdenReparacion.estado.in_([
                EstadoOrden.EN_ESPERA,
                EstadoOrden.EN_DIAGNOSTICO,
                EstadoOrden.EN_REPARACION,
                EstadoOrden.LISTO,
            ]),
        ).order_by(OrdenReparacion.id.desc())
    ).scalars().first()

    if not orden_activa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"No hay ninguna Orden de Reparación activa asignada actualmente a la '{bahia.nombre_bahia}' "
                f"(ID: {bahia_id}). Debe asignar una orden en proceso a esta bahía antes de guardar fotos de inspección."
            ),
        )

    # 3. Decodificar la imagen Base64 del fotograma
    img_data_str = payload.imagen_base64
    if "," in img_data_str:
        # Remover prefijo data:image/jpeg;base64,... si está presente
        img_data_str = img_data_str.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(img_data_str)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error decodificando imagen base64 del fotograma: {str(exc)}",
        )

    # 4. Asegurar directorio de almacenamiento y guardar archivo
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"inspeccion_or_{orden_activa.id}_bahia_{bahia_id}_{uuid.uuid4().hex[:8]}.jpg"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    try:
        with open(file_path, "wb") as f:
            f.write(image_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo guardar el archivo en disco: {str(exc)}",
        )

    # 5. Crear el registro de Evidencia en base de datos
    evidencia = EvidenciaInspeccion(
        orden_id=orden_activa.id,
        camara_id=payload.camara_id,
        archivo_path=file_path.replace("\\", "/"),
        notas=payload.notas or f"Foto de inspección tomada en {bahia.nombre_bahia}",
    )
    db.add(evidencia)
    db.commit()
    db.refresh(evidencia)

    return evidencia

