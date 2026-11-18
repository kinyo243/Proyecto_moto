import io
import os
from datetime import datetime
from typing import List, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
    HRFlowable,
)

from app.models.orden_reparacion import OrdenReparacion
from app.models.dvi import InspeccionDVI, ItemDVI, EstadoDVI, EstadoAprobacion


def generate_dvi_report_pdf(
    orden: OrdenReparacion,
    inspeccion: Optional[InspeccionDVI] = None,
) -> io.BytesIO:
    """
    Genera un informe técnico profesional en PDF que compila:
    1. Datos del Taller, Cliente y Vehículo
    2. Diagnóstico y semáforo del DVI (Frenos, Neumáticos, Fluidos, Suspensión)
    3. Evidencias fotográficas tomadas en bahía o inspección
    4. Firma digitalizada del cliente con fecha de aprobación
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Estilos tipográficos personalizados
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#2563eb"),
        textTransform="uppercase",
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )
    body_bold = ParagraphStyle(
        "DocBodyBold",
        parent=body_style,
        fontName="Helvetica-Bold",
    )
    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1e293b"),
    )
    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=table_cell,
        fontName="Helvetica-Bold",
    )

    elements = []

    # -------------------------------------------------------------
    # 1. ENCABEZADO Y BRANDING DEL TALLER
    # -------------------------------------------------------------
    header_data = [
        [
            Paragraph("<b>CENTRO DE SERVICIO AUTOMOTRIZ & MOTOS</b><br/><font color='#64748b' size='8'>Gestión Integral de Taller • Diagnóstico Digital DVI</font>", body_style),
            Paragraph(f"<b>INFORME DVI #OR-{orden.id:04d}</b><br/><font size='8' color='#64748b'>Fecha Emisión: {datetime.now().strftime('%d/%m/%Y %H:%M')}</font>", ParagraphStyle("RightH", parent=body_style, alignment=2)),
        ]
    ]
    t_header = Table(header_data, colWidths=[340, 200])
    t_header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    elements.append(t_header)
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2563eb"), spaceAfter=12))

    # -------------------------------------------------------------
    # 2. INFORMACIÓN CONSOLIDADA: CLIENTE, VEHÍCULO Y ORDEN
    # -------------------------------------------------------------
    cliente = orden.vehiculo.cliente if orden.vehiculo else None
    vehiculo = orden.vehiculo

    info_data = [
        [
            Paragraph("<b>DATOS DEL CLIENTE</b>", subtitle_style),
            Paragraph("<b>DATOS DEL VEHÍCULO</b>", subtitle_style),
        ],
        [
            Paragraph(
                f"<b>Nombre:</b> {cliente.nombre if cliente else 'N/A'}<br/>"
                f"<b>Teléfono:</b> {cliente.telefono if cliente else 'N/A'}<br/>"
                f"<b>Email:</b> {cliente.email if cliente and cliente.email else 'No registrado'}<br/>"
                f"<b>Tipo:</b> {cliente.tipo.capitalize() if cliente else 'Regular'}",
                table_cell,
            ),
            Paragraph(
                f"<b>Vehículo:</b> {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})<br/>"
                f"<b>Placa:</b> <font color='#2563eb'><b>{vehiculo.placa}</b></font> | <b>VIN:</b> {vehiculo.vin or 'S/N'}<br/>"
                f"<b>Kilometraje:</b> {vehiculo.kilometraje_actual:,} km<br/>"
                f"<b>Combustible:</b> {vehiculo.nivel_combustible.value}",
                table_cell,
            ),
        ],
        [
            Paragraph(
                f"<b>Estado Actual de OR:</b> {orden.estado.value}<br/>"
                f"<b>Fecha de Ingreso:</b> {orden.fecha_creacion.strftime('%d/%m/%Y %H:%M')}",
                table_cell,
            ),
            Paragraph(
                f"<b>Bahía Asignada:</b> {orden.bahia.nombre_bahia if orden.bahia else 'Área General'}<br/>"
                f"<b>Notas de Ingreso:</b> {orden.notas_recepcion or 'Sin observaciones iniciales'}",
                table_cell,
            ),
        ],
    ]
    t_info = Table(info_data, colWidths=[270, 270])
    t_info.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 3. SEMÁFORO DE INSPECCIÓN DIGITAL (DVI)
    # -------------------------------------------------------------
    elements.append(Paragraph("RESULTADOS DE LA INSPECCIÓN TÉCNICA DIGITAL (DVI)", section_heading))

    dvi_table_data = [
        [
            Paragraph("<b>Categoría</b>", table_cell_bold),
            Paragraph("<b>Componente Evaluado</b>", table_cell_bold),
            Paragraph("<b>Estado Técnico</b>", table_cell_bold),
            Paragraph("<b>Hallazgos y Observaciones</b>", table_cell_bold),
        ]
    ]

    items: List[ItemDVI] = inspeccion.items if inspeccion and inspeccion.items else []

    if items:
        for it in items:
            # Colores del semáforo
            if it.estado == EstadoDVI.VERDE:
                badge = "<font color='#16a34a'><b>● VERDE (OK)</b></font>"
            elif it.estado == EstadoDVI.AMARILLO:
                badge = "<font color='#ca8a04'><b>▲ AMARILLO (Atención)</b></font>"
            else:
                badge = "<font color='#dc2626'><b>■ ROJO (Urgente)</b></font>"

            dvi_table_data.append([
                Paragraph(it.categoria, table_cell),
                Paragraph(f"<b>{it.nombre_item}</b>", table_cell),
                Paragraph(badge, table_cell),
                Paragraph(it.observaciones or "Conforme, sin anomalías reportadas.", table_cell),
            ])
    else:
        dvi_table_data.append([
            Paragraph("Inspección General", table_cell),
            Paragraph("Checklist Inicial", table_cell),
            Paragraph("<font color='#16a34a'><b>● VERDE (OK)</b></font>", table_cell),
            Paragraph("Vehículo recibido y evaluado en recepción.", table_cell),
        ])

    t_dvi = Table(dvi_table_data, colWidths=[90, 140, 110, 200])
    t_dvi.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(t_dvi)
    elements.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 4. EVIDENCIAS FOTOGRÁFICAS (CÁMARAS DE BAHÍA Y FOTOS DE INSPECCIÓN)
    # -------------------------------------------------------------
    # Recolectar fotos de la cámara de la bahía y del DVI
    fotos_paths = []
    if orden.evidencias:
        for ev in orden.evidencias:
            if ev.archivo_path and os.path.exists(ev.archivo_path):
                fotos_paths.append((ev.archivo_path, ev.notas or "Evidencia de cámara de bahía"))

    if items:
        for it in items:
            for ev in it.evidencias:
                if ev.archivo_path and os.path.exists(ev.archivo_path):
                    fotos_paths.append((ev.archivo_path, f"{it.nombre_item}: {ev.descripcion or ''}"))

    if fotos_paths:
        elements.append(Paragraph("EVIDENCIA FOTOGRÁFICA DE INSPECCIÓN", section_heading))
        img_cells = []
        row = []
        for path, desc in fotos_paths[:4]:  # Hasta 4 evidencias destacadas
            try:
                img = RLImage(path, width=160, height=105)
                cell_content = [
                    img,
                    Spacer(1, 2),
                    Paragraph(f"<font size='7' color='#475569'>{desc}</font>", table_cell),
                ]
                row.append(cell_content)
                if len(row) == 3:
                    img_cells.append(row)
                    row = []
            except Exception as e:
                print(f"[PDF Image Warning] Error al cargar imagen {path}: {e}")

        if row:
            while len(row) < 3:
                row.append([])
            img_cells.append(row)

        if img_cells:
            t_imgs = Table(img_cells, colWidths=[180, 180, 180])
            t_imgs.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]))
            elements.append(t_imgs)
            elements.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 4.5. PRESUPUESTO Y DESGLOSE FINANCIERO (REPUESTOS Y MANO DE OBRA)
    # -------------------------------------------------------------
    presupuesto = getattr(orden, "presupuesto", None)
    if presupuesto and presupuesto.items:
        elements.append(Paragraph("PRESUPUESTO ESTIMADO DE REPARACIÓN Y REPUESTOS", section_heading))

        filas_presupuesto = [
            [
                Paragraph("<b>Tipo</b>", table_cell_bold),
                Paragraph("<b>Descripción del Trabajo / Repuesto</b>", table_cell_bold),
                Paragraph("<b>Cant.</b>", table_cell_bold),
                Paragraph("<b>P. Unitario</b>", table_cell_bold),
                Paragraph("<b>Subtotal</b>", table_cell_bold),
            ]
        ]

        subtotal_items = 0.0
        for it in presupuesto.items:
            subt = round(it.cantidad * it.precio_unitario, 2)
            subtotal_items += subt
            tipo_tag = f"<font color='#0284c7'><b>[{it.tipo.value}]</b></font>"
            filas_presupuesto.append([
                Paragraph(tipo_tag, table_cell),
                Paragraph(it.descripcion, table_cell),
                Paragraph(f"{it.cantidad:g}", table_cell),
                Paragraph(f"${it.precio_unitario:,.2f}", table_cell),
                Paragraph(f"<b>${subt:,.2f}</b>", table_cell_bold),
            ])

        desc = presupuesto.descuento or 0.0
        base = max(0.0, subtotal_items - desc)
        imp = round(base * (presupuesto.impuesto_porcentaje / 100.0), 2)
        tot = round(base + imp, 2)

        # Totales calculados
        filas_presupuesto.append([
            "", "", "", Paragraph("<b>Subtotal:</b>", table_cell_bold),
            Paragraph(f"${subtotal_items:,.2f}", table_cell)
        ])
        if desc > 0:
            filas_presupuesto.append([
                "", "", "", Paragraph("<b>Descuento:</b>", table_cell_bold),
                Paragraph(f"-${desc:,.2f}", table_cell)
            ])
        filas_presupuesto.append([
            "", "", "", Paragraph(f"<b>IVA ({presupuesto.impuesto_porcentaje:g}%):</b>", table_cell_bold),
            Paragraph(f"${imp:,.2f}", table_cell)
        ])
        filas_presupuesto.append([
            "", "", "", Paragraph("<b>TOTAL NETO:</b>", table_cell_bold),
            Paragraph(f"<font color='#16a34a' size='10'><b>${tot:,.2f}</b></font>", table_cell_bold)
        ])

        t_presupuesto = Table(filas_presupuesto, colWidths=[90, 230, 45, 85, 90])
        t_presupuesto.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("LINEBELOW", (0, 0), (-1, 0), 1, colors.HexColor("#cbd5e1")),
            ("LINEBELOW", (0, 1), (-1, -5 if desc > 0 else -4), 0.5, colors.HexColor("#f1f5f9")),
            ("LINEABOVE", (3, -4 if desc > 0 else -3), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_presupuesto)
        elements.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 5. CONFORMIDAD Y FIRMA DIGITAL DEL CLIENTE
    # -------------------------------------------------------------
    elements.append(Paragraph("APROBACIÓN TÉCNICA Y FIRMA DIGITAL DEL CLIENTE", section_heading))

    firma_img = None
    if inspeccion and inspeccion.firma_cliente and os.path.exists(inspeccion.firma_cliente):
        try:
            firma_img = RLImage(inspeccion.firma_cliente, width=160, height=60)
        except Exception:
            firma_img = None

    firmante_nombre = (inspeccion.nombre_firmante if inspeccion and inspeccion.nombre_firmante else (cliente.nombre if cliente else "Cliente"))
    firmante_doc = (f"Doc: {inspeccion.documento_firmante}" if inspeccion and inspeccion.documento_firmante else "")
    fecha_firma_txt = (inspeccion.fecha_firma.strftime("%d/%m/%Y %H:%M") if inspeccion and inspeccion.fecha_firma else "Pendiente de firma")
    estado_aprob = (inspeccion.estado_aprobacion.value if inspeccion else "Pendiente")

    col_terminos = Paragraph(
        "<b>Declaración de Aprobación:</b><br/>"
        "El cliente certifica haber recibido el diagnóstico técnico digital (DVI) y autoriza la ejecución de los "
        "trabajos y repuestos cotizados para su motocicleta o vehículo automotriz.<br/><br/>"
        f"<b>Estado:</b> <font color='#2563eb'><b>{estado_aprob.upper()}</b></font><br/>"
        f"<b>Fecha de Consentimiento:</b> {fecha_firma_txt}",
        table_cell,
    )

    col_firma_content = []
    if firma_img:
        col_firma_content.append(firma_img)
    else:
        col_firma_content.append(Spacer(1, 35))
        col_firma_content.append(Paragraph("<i>[ Firma Digital Registrada ]</i>", table_cell))

    col_firma_content.append(HRFlowable(width="90%", thickness=1, color=colors.HexColor("#94a3b8"), spaceBefore=4, spaceAfter=4))
    col_firma_content.append(Paragraph(f"<b>{firmante_nombre}</b><br/>{firmante_doc}", table_cell))

    t_firma = Table([[col_terminos, col_firma_content]], colWidths=[330, 210])
    t_firma.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(KeepTogether(t_firma))

    # Construir documento
    doc.build(elements)
    buffer.seek(0)
    return buffer

