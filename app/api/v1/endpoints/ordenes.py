from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select

from app.core.database import get_db
from app.models.vehiculo import Vehiculo
from app.models.orden_reparacion import OrdenReparacion, EstadoOrden
from app.models.dvi import InspeccionDVI
from app.schemas.orden_reparacion import (
    OrdenReparacionCreate,
    OrdenReparacionUpdate,
    OrdenReparacionStatusUpdate,
    OrdenReparacionResponse,
    OrdenReparacionDetailResponse,
)
from app.schemas.dvi import FirmaClientePayload, InspeccionDVIResponse
from app.services.pdf_generator import generate_dvi_report_pdf
from app.api.v1.endpoints.dvi import save_client_signature as save_signature_handler

router = APIRouter()


@router.post(
    "",
    response_model=OrdenReparacionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una nueva Orden de Reparación (Recepción con estado 'En Espera')",
)
def create_orden(
    payload: OrdenReparacionCreate,
    allow_concurrent: bool = Query(
        False,
        description="Si es False, rechaza la creación si el vehículo ya tiene una orden activa en taller",
    ),
    db: Session = Depends(get_db),
):
    """
    Registra el ingreso del vehículo al taller emitiendo una nueva Orden de Reparación (OR).
    Por regla de negocio, el estado inicial es forzado a 'En Espera'.
    """
    # 1. Validar que el vehículo exista
    vehiculo = db.get(Vehiculo, payload.vehiculo_id)
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se puede abrir la orden: El vehículo con ID {payload.vehiculo_id} no existe en el sistema.",
        )

    # 2. Validar que el vehículo no tenga una orden activa en proceso (a menos que se fuerce)
    if not allow_concurrent:
        active_order = db.execute(
            select(OrdenReparacion).where(
                OrdenReparacion.vehiculo_id == payload.vehiculo_id,
                OrdenReparacion.estado.in_([
                    EstadoOrden.EN_ESPERA,
                    EstadoOrden.EN_DIAGNOSTICO,
                    EstadoOrden.EN_REPARACION,
                    EstadoOrden.LISTO,
                ]),
            )
        ).scalars().first()

        if active_order:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"El vehículo con placa '{vehiculo.placa}' (ID: {vehiculo.id}) ya posee una orden activa en taller "
                    f"(Orden #{active_order.id} en estado '{active_order.estado.value}'). "
                    "Debe finalizar o entregar la orden previa antes de crear una nueva, o activar allow_concurrent=true."
                ),
            )

    # 3. Forzar estado inicial 'En Espera' para la recepción
    data = payload.model_dump()
    data["estado"] = EstadoOrden.EN_ESPERA

    nueva_orden = OrdenReparacion(**data)
    db.add(nueva_orden)
    db.commit()
    db.refresh(nueva_orden)
    return nueva_orden


@router.get(
    "/{orden_id}",
    response_model=OrdenReparacionDetailResponse,
    summary="Obtener detalle completo de la OR (incluye datos de vehículo y cliente)",
)
def get_orden(
    orden_id: int,
    db: Session = Depends(get_db),
):
    """
    Recupera la información completa de una Orden de Reparación, incluyendo los datos
    técnicos del vehículo (placa, marca, kilometraje, combustible) y del cliente propietario.
    """
    query = (
        select(OrdenReparacion)
        .options(
            joinedload(OrdenReparacion.vehiculo).joinedload(Vehiculo.cliente)
        )
        .where(OrdenReparacion.id == orden_id)
    )
    orden = db.execute(query).scalars().first()

    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden de Reparación con ID {orden_id} no encontrada en el sistema.",
        )

    return orden


@router.get(
    "",
    response_model=List[OrdenReparacionResponse],
    summary="Listar órdenes de reparación con filtros",
)
def list_ordenes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[EstadoOrden] = Query(None, description="Filtrar por estado del taller"),
    vehiculo_id: Optional[int] = Query(None, description="Filtrar por vehículo"),
    db: Session = Depends(get_db),
):
    query = select(OrdenReparacion)

    if estado:
        query = query.where(OrdenReparacion.estado == estado)

    if vehiculo_id:
        query = query.where(OrdenReparacion.vehiculo_id == vehiculo_id)

    query = query.order_by(OrdenReparacion.fecha_creacion.desc()).offset(skip).limit(limit)
    return db.execute(query).scalars().all()


@router.patch(
    "/{orden_id}/estado",
    response_model=OrdenReparacionResponse,
    summary="Transicionar estado operativo de la orden",
)
def update_orden_status(
    orden_id: int,
    payload: OrdenReparacionStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Transiciona el estado de la OR:
    En Espera -> En Diagnóstico -> En Reparación -> Listo -> Entregado.
    """
    orden = db.get(OrdenReparacion, orden_id)
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden de Reparación con ID {orden_id} no encontrada.",
        )

    orden.estado = payload.estado
    db.commit()
    db.refresh(orden)
    return orden


@router.put(
    "/{orden_id}",
    response_model=OrdenReparacionResponse,
    summary="Actualizar notas y datos de la Orden",
)
def update_orden(
    orden_id: int,
    payload: OrdenReparacionUpdate,
    db: Session = Depends(get_db),
):
    orden = db.get(OrdenReparacion, orden_id)
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden de Reparación con ID {orden_id} no encontrada.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(orden, field, value)

    db.commit()
    db.refresh(orden)
    return orden


@router.delete(
    "/{orden_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cancelar o eliminar orden de reparación",
)
def delete_orden(
    orden_id: int,
    db: Session = Depends(get_db),
):
    orden = db.get(OrdenReparacion, orden_id)
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden de Reparación con ID {orden_id} no encontrada.",
        )

    db.delete(orden)
    db.commit()
    return None


@router.post(
    "/{orden_id}/firma",
    response_model=InspeccionDVIResponse,
    summary="Capturar y almacenar firma digital del cliente",
)
def register_signature(
    orden_id: int,
    payload: FirmaClientePayload,
    db: Session = Depends(get_db),
):
    """
    Captura y almacena la firma digitalizada del cliente para la orden de reparación.
    """
    return save_signature_handler(orden_id=orden_id, payload=payload, db=db)


@router.get(
    "/{orden_id}/reporte-pdf",
    summary="Generar y descargar informe profesional PDF de la Orden y DVI",
)
def get_orden_pdf_report(
    orden_id: int,
    db: Session = Depends(get_db),
):
    """
    Genera el informe profesional en PDF compilando datos de la orden, vehículo, cliente,
    semáforo DVI, fotografías de inspección y firma del cliente.
    """
    orden = db.get(OrdenReparacion, orden_id)
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden de Reparación con ID {orden_id} no encontrada.",
        )

    dvi = db.execute(
        select(InspeccionDVI).where(InspeccionDVI.orden_id == orden_id)
    ).scalars().first()

    pdf_buffer = generate_dvi_report_pdf(orden=orden, inspeccion=dvi)
    filename = f"reporte_taller_or_{orden_id}_{orden.vehiculo.placa}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={filename}",
            "Cache-Control": "no-cache",
        },
    )
