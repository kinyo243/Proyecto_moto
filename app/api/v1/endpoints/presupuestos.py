from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.models.orden_reparacion import OrdenReparacion
from app.models.presupuesto import (
    Presupuesto,
    ItemPresupuesto,
    Pago,
    EstadoPresupuesto,
)
from app.schemas.presupuesto import (
    PresupuestoCreate,
    PresupuestoUpdate,
    PresupuestoResponse,
    ItemPresupuestoCreate,
    ItemPresupuestoUpdate,
    ItemPresupuestoResponse,
    PagoCreate,
    PagoResponse,
    BalanceOrdenResponse,
)

router = APIRouter()


@router.post(
    "",
    response_model=PresupuestoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear o inicializar presupuesto para una Orden",
)
def create_presupuesto(
    payload: PresupuestoCreate,
    db: Session = Depends(get_db),
):
    orden = db.get(OrdenReparacion, payload.orden_id)
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La orden #{payload.orden_id} no existe.",
        )

    # Verificar si ya existe un presupuesto
    existing = db.execute(
        select(Presupuesto).where(Presupuesto.orden_id == payload.orden_id)
    ).scalars().first()
    if existing:
        return existing

    presupuesto = Presupuesto(
        orden_id=payload.orden_id,
        impuesto_porcentaje=payload.impuesto_porcentaje,
        descuento=payload.descuento,
        notas=payload.notas,
        estado=EstadoPresupuesto.BORRADOR,
    )
    db.add(presupuesto)
    db.flush()

    if payload.items:
        for item_in in payload.items:
            nuevo_item = ItemPresupuesto(
                presupuesto_id=presupuesto.id,
                tipo=item_in.tipo,
                descripcion=item_in.descripcion,
                cantidad=item_in.cantidad,
                precio_unitario=item_in.precio_unitario,
            )
            db.add(nuevo_item)

    db.commit()
    db.refresh(presupuesto)
    return presupuesto


@router.get(
    "/orden/{orden_id}",
    response_model=PresupuestoResponse,
    summary="Obtener presupuesto por ID de orden",
)
def get_presupuesto_by_orden(
    orden_id: int,
    db: Session = Depends(get_db),
):
    presupuesto = db.execute(
        select(Presupuesto).where(Presupuesto.orden_id == orden_id)
    ).scalars().first()
    if not presupuesto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró presupuesto para la orden #{orden_id}.",
        )
    return presupuesto


@router.patch(
    "/{presupuesto_id}",
    response_model=PresupuestoResponse,
    summary="Actualizar cabecera del presupuesto (estado, descuento, notas)",
)
def update_presupuesto(
    presupuesto_id: int,
    payload: PresupuestoUpdate,
    db: Session = Depends(get_db),
):
    presupuesto = db.get(Presupuesto, presupuesto_id)
    if not presupuesto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Presupuesto #{presupuesto_id} no encontrado.",
        )

    if payload.estado is not None:
        presupuesto.estado = payload.estado
    if payload.impuesto_porcentaje is not None:
        presupuesto.impuesto_porcentaje = payload.impuesto_porcentaje
    if payload.descuento is not None:
        presupuesto.descuento = payload.descuento
    if payload.notas is not None:
        presupuesto.notas = payload.notas

    db.commit()
    db.refresh(presupuesto)
    return presupuesto


@router.post(
    "/{presupuesto_id}/items",
    response_model=ItemPresupuestoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar un ítem de repuesto o mano de obra",
)
def add_item_presupuesto(
    presupuesto_id: int,
    payload: ItemPresupuestoCreate,
    db: Session = Depends(get_db),
):
    presupuesto = db.get(Presupuesto, presupuesto_id)
    if not presupuesto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Presupuesto #{presupuesto_id} no encontrado.",
        )

    item = ItemPresupuesto(
        presupuesto_id=presupuesto_id,
        tipo=payload.tipo,
        descripcion=payload.descripcion,
        cantidad=payload.cantidad,
        precio_unitario=payload.precio_unitario,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un ítem del presupuesto",
)
def delete_item_presupuesto(
    item_id: int,
    db: Session = Depends(get_db),
):
    item = db.get(ItemPresupuesto, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ítem #{item_id} no encontrado.",
        )
    db.delete(item)
    db.commit()
    return None


# ─── GESTIÓN DE PAGOS ──────────────────────────────────────────────────────────

@router.post(
    "/pagos",
    response_model=PagoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un pago / abono a una orden",
)
def registrar_pago(
    payload: PagoCreate,
    db: Session = Depends(get_db),
):
    orden = db.get(OrdenReparacion, payload.orden_id)
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La orden #{payload.orden_id} no existe.",
        )

    pago = Pago(
        orden_id=payload.orden_id,
        monto=payload.monto,
        metodo_pago=payload.metodo_pago,
        referencia=payload.referencia,
        notas=payload.notas,
    )
    db.add(pago)
    db.commit()
    db.refresh(pago)
    return pago


@router.get(
    "/orden/{orden_id}/balance",
    response_model=BalanceOrdenResponse,
    summary="Consultar el balance financiero (total cotizado, pagado y saldo pendiente)",
)
def get_balance_orden(
    orden_id: int,
    db: Session = Depends(get_db),
):
    orden = db.get(OrdenReparacion, orden_id)
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La orden #{orden_id} no existe.",
        )

    # Calcular total presupuesto
    presupuesto = db.execute(
        select(Presupuesto).where(Presupuesto.orden_id == orden_id)
    ).scalars().first()

    total_presupuesto = 0.0
    if presupuesto:
        subtotal = sum(i.cantidad * i.precio_unitario for i in presupuesto.items)
        base = max(0.0, subtotal - presupuesto.descuento)
        impuesto = base * (presupuesto.impuesto_porcentaje / 100.0)
        total_presupuesto = round(base + impuesto, 2)

    # Calcular total pagado
    pagos = db.execute(
        select(Pago).where(Pago.orden_id == orden_id).order_by(Pago.fecha_pago.desc())
    ).scalars().all()

    total_pagado = round(sum(p.monto for p in pagos), 2)
    saldo_pendiente = max(0.0, round(total_presupuesto - total_pagado, 2))

    if not presupuesto:
        estado_pago = "Sin Presupuesto"
    elif total_pagado == 0:
        estado_pago = "Pendiente"
    elif total_pagado >= total_presupuesto:
        estado_pago = "Pagado Total"
    else:
        estado_pago = "Parcialmente Pagado"

    return BalanceOrdenResponse(
        orden_id=orden_id,
        total_presupuesto=total_presupuesto,
        total_pagado=total_pagado,
        saldo_pendiente=saldo_pendiente,
        estado_pago=estado_pago,
        pagos=[PagoResponse.model_validate(p) for p in pagos],
    )

