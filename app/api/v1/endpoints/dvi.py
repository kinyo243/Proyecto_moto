import os
import base64
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.orden_reparacion import OrdenReparacion
from app.models.dvi import InspeccionDVI, ItemDVI, EvidenciaItemDVI, EstadoDVI, EstadoAprobacion, TipoEvidenciaDVI
from app.schemas.dvi import (
    InspeccionDVICreate,
    InspeccionDVIResponse,
    ItemDVICreate,
    ItemDVIUpdate,
    ItemDVIResponse,
    EvidenciaItemDVICreate,
    EvidenciaItemDVIResponse,
    FirmaClientePayload,
)
from app.services.pdf_generator import generate_dvi_report_pdf

router = APIRouter()

# Plantilla esencial de inspección preventiva para motos y autos
PLANTILLA_ESENCIAL = [
    # Frenos
    {"categoria": "Frenos", "nombre_item": "Pastillas y zapatas de freno"},
    {"categoria": "Frenos", "nombre_item": "Líquido de frenos y presión de maneta/pedal"},
    {"categoria": "Frenos", "nombre_item": "Discos de freno y tambores"},
    # Neumáticos
    {"categoria": "Neumáticos", "nombre_item": "Presión y desgaste de neumático delantero"},
    {"categoria": "Neumáticos", "nombre_item": "Presión y desgaste de neumático trasero"},
    # Fluidos
    {"categoria": "Fluidos", "nombre_item": "Nivel y viscosidad de aceite de motor"},
    {"categoria": "Fluidos", "nombre_item": "Líquido refrigerante / radiador"},
    # Suspensión
    {"categoria": "Suspensión", "nombre_item": "Horquillas delanteras (retenes, botellas y fugas)"},
    {"categoria": "Suspensión", "nombre_item": "Amortiguador trasero / Monoshock"},
]


@router.post(
    "",
    response_model=InspeccionDVIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear o inicializar DVI para una Orden de Reparación",
)
def create_or_init_dvi(
    payload: InspeccionDVICreate,
    db: Session = Depends(get_db),
):
    """
    Inicializa la hoja de Inspección Digital de Vehículo (DVI) para una orden.
    Si 'usar_plantilla_esencial' es True, precarga los ítems estándar:
    Frenos, Neumáticos, Fluidos y Suspensión.
    """
    # 1. Validar que la orden exista
    orden = db.get(OrdenReparacion, payload.orden_id)
    if not orden:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se puede crear DVI: La Orden de Reparación con ID {payload.orden_id} no existe.",
        )

    # 2. Verificar si ya existía DVI para esta orden
    existing_dvi = db.execute(
        select(InspeccionDVI).where(InspeccionDVI.orden_id == payload.orden_id)
    ).scalars().first()

    if existing_dvi:
        return existing_dvi

    # 3. Crear cabecera DVI
    nuevo_dvi = InspeccionDVI(
        orden_id=payload.orden_id,
        tecnico_responsable=payload.tecnico_responsable,
        notas_generales=payload.notas_generales,
        estado_aprobacion=EstadoAprobacion.PENDIENTE,
    )
    db.add(nuevo_dvi)
    db.flush()

    # 4. Crear ítems de la plantilla esencial
    items_to_add = []
    if payload.usar_plantilla_esencial:
        for p in PLANTILLA_ESENCIAL:
            items_to_add.append(
                ItemDVI(
                    inspeccion_id=nuevo_dvi.id,
                    categoria=p["categoria"],
                    nombre_item=p["nombre_item"],
                    estado=EstadoDVI.VERDE,
                    observaciones=None,
                )
            )

    # 5. Agregar ítems personalizados adicionales si fueron provistos
    if payload.items_personalizados:
        for it in payload.items_personalizados:
            items_to_add.append(
                ItemDVI(
                    inspeccion_id=nuevo_dvi.id,
                    categoria=it.categoria,
                    nombre_item=it.nombre_item,
                    estado=it.estado,
                    observaciones=it.observaciones,
                )
            )

    db.add_all(items_to_add)
    db.commit()
    db.refresh(nuevo_dvi)
    return nuevo_dvi


@router.get(
    "/orden/{orden_id}",
    response_model=InspeccionDVIResponse,
    summary="Obtener DVI de una orden de reparación",
)
def get_dvi_by_orden(
    orden_id: int,
    db: Session = Depends(get_db),
):
    dvi = db.execute(
        select(InspeccionDVI).where(InspeccionDVI.orden_id == orden_id)
    ).scalars().first()

    if not dvi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró una inspección DVI asociada a la Orden #{orden_id}.",
        )
    return dvi


@router.patch(
    "/items/{item_id}",
    response_model=ItemDVIResponse,
    summary="Actualizar estado semáforo y observaciones de un ítem del DVI",
)
def update_dvi_item(
    item_id: int,
    payload: ItemDVIUpdate,
    db: Session = Depends(get_db),
):
    """
    Permite al mecánico cambiar el estado técnico (Verde, Amarillo, Rojo)
    y registrar hallazgos específicos por componente.
    """
    item = db.get(ItemDVI, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ítem de DVI con ID {item_id} no encontrado.",
        )

    if payload.estado is not None:
        item.estado = payload.estado
    if payload.observaciones is not None:
        item.observaciones = payload.observaciones

    db.commit()
    db.refresh(item)
    return item


@router.post(
    "/items/{item_id}/evidencias",
    response_model=EvidenciaItemDVIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Adjuntar evidencia fotográfica o clip de video corto a un ítem",
)
def attach_evidence_to_item(
    item_id: int,
    payload: EvidenciaItemDVICreate,
    db: Session = Depends(get_db),
):
    """
    Adjunta una fotografía o video corto de respaldo técnico para justificar
    el estado (Amarillo o Rojo) asignado al componente.
    """
    item = db.get(ItemDVI, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ítem de DVI con ID {item_id} no encontrado.",
        )

    if not payload.archivo_base64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe suministrar 'archivo_base64' para guardar la evidencia.",
        )

    # Decodificar Base64
    raw_str = payload.archivo_base64
    if "," in raw_str:
        raw_str = raw_str.split(",", 1)[1]

    try:
        file_bytes = base64.b64decode(raw_str)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error decodificando archivo base64: {str(exc)}",
        )

    ext = "jpg" if payload.tipo_archivo == TipoEvidenciaDVI.FOTO else "mp4"
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"dvi_item_{item_id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error guardando evidencia en disco: {str(exc)}",
        )

    evidencia = EvidenciaItemDVI(
        item_dvi_id=item_id,
        tipo_archivo=payload.tipo_archivo,
        archivo_path=file_path.replace("\\", "/"),
        descripcion=payload.descripcion,
    )
    db.add(evidencia)
    db.commit()
    db.refresh(evidencia)
    return evidencia


@router.post(
    "/orden/{orden_id}/firma",
    response_model=InspeccionDVIResponse,
    summary="Registrar firma digital y aprobación del cliente",
)
def save_client_signature(
    orden_id: int,
    payload: FirmaClientePayload,
    db: Session = Depends(get_db),
):
    """
    Almacena la firma digitalizada del cliente (capturada en pantalla táctil/canvas)
    asociada a la aprobación del presupuesto y diagnóstico del DVI.
    """
    # 1. Obtener o crear DVI si no existía aún
    dvi = db.execute(
        select(InspeccionDVI).where(InspeccionDVI.orden_id == orden_id)
    ).scalars().first()

    if not dvi:
        # Inicializar DVI si se firma directamente
        orden = db.get(OrdenReparacion, orden_id)
        if not orden:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Orden #{orden_id} no existe.",
            )
        dvi = InspeccionDVI(
            orden_id=orden_id,
            estado_aprobacion=EstadoAprobacion.APROBADO if payload.aprobado else EstadoAprobacion.RECHAZADO,
        )
        db.add(dvi)
        db.flush()

    # 2. Decodificar firma PNG
    raw_sig = payload.firma_base64
    if "," in raw_sig:
        raw_sig = raw_sig.split(",", 1)[1]

    try:
        sig_bytes = base64.b64decode(raw_sig)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error decodificando imagen de firma: {str(exc)}",
        )

    firmas_dir = os.path.join(settings.UPLOAD_DIR, "firmas")
    os.makedirs(firmas_dir, exist_ok=True)
    sig_filename = f"firma_or_{orden_id}_{uuid.uuid4().hex[:6]}.png"
    sig_path = os.path.join(firmas_dir, sig_filename)

    with open(sig_path, "wb") as f:
        f.write(sig_bytes)

    # 3. Guardar metadatos de aprobación en el DVI
    dvi.firma_cliente = sig_path.replace("\\", "/")
    dvi.nombre_firmante = payload.nombre_firmante
    dvi.documento_firmante = payload.documento_firmante
    dvi.fecha_firma = datetime.now()
    dvi.estado_aprobacion = EstadoAprobacion.APROBADO if payload.aprobado else EstadoAprobacion.RECHAZADO

    if payload.notas:
        nota_adicional = f"\n[Firma del Cliente]: {payload.notas}"
        dvi.notas_generales = (dvi.notas_generales or "") + nota_adicional

    db.commit()
    db.refresh(dvi)
    return dvi


@router.get(
    "/orden/{orden_id}/pdf",
    summary="Generar y descargar informe profesional DVI en PDF",
)
def download_dvi_pdf_report(
    orden_id: int,
    db: Session = Depends(get_db),
):
    """
    Compila la Orden de Reparación, resultados del DVI, fotos de cámaras y firma
    en un archivo PDF profesional listo para descargar o compartir por WhatsApp.
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

    filename = f"reporte_dvi_or_{orden_id}_{orden.vehiculo.placa}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={filename}",
            "Cache-Control": "no-cache",
        },
    )

