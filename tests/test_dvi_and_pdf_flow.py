import base64
import pytest
from fastapi.testclient import TestClient


def test_flujo_completo_dvi_firma_y_pdf(client: TestClient):
    """
    Prueba el ciclo completo del DVI:
    1. Crear Cliente, Vehículo y Orden de Reparación
    2. Inicializar la Inspección Digital (DVI) con la plantilla esencial
    3. Evaluar y cambiar estados del semáforo (Verde, Amarillo, Rojo)
    4. Adjuntar evidencia fotográfica a un ítem en Rojo
    5. Capturar y almacenar la firma digital del cliente
    6. Compilar y descargar el informe profesional en PDF (validando formato application/pdf)
    """
    # 1. Crear cliente
    cli_res = client.post(
        "/api/v1/clientes",
        json={"nombre": "Roberto Morales", "telefono": "+584123334455", "email": "roberto@example.com"},
    )
    assert cli_res.status_code == 201
    cliente_id = cli_res.json()["id"]

    # Crear vehículo
    veh_res = client.post(
        "/api/v1/vehiculos",
        json={
            "cliente_id": cliente_id,
            "marca": "Kawasaki",
            "modelo": "Ninja 400",
            "anio": 2023,
            "placa": "KW-400X",
            "kilometraje_actual": 12000,
            "nivel_combustible": "1/2",
        },
    )
    assert veh_res.status_code == 201
    vehiculo_id = veh_res.json()["id"]

    # Crear orden de reparación
    or_res = client.post(
        "/api/v1/ordenes-reparacion",
        json={
            "vehiculo_id": vehiculo_id,
            "notas_recepcion": "Revisión general de los 12,000 km y ruido al frenar",
        },
    )
    assert or_res.status_code == 201
    orden_id = or_res.json()["id"]

    # 2. Inicializar DVI con la plantilla esencial (Frenos, Neumáticos, Fluidos, Suspensión)
    dvi_init_res = client.post(
        "/api/v1/dvi",
        json={
            "orden_id": orden_id,
            "tecnico_responsable": "Carlos Técnico Especialista",
            "notas_generales": "Inspección preventiva rigurosa de 9 puntos",
            "usar_plantilla_esencial": True,
        },
    )
    assert dvi_init_res.status_code == 201
    dvi = dvi_init_res.json()
    assert dvi["id"] is not None
    assert dvi["orden_id"] == orden_id
    assert len(dvi["items"]) >= 9
    assert dvi["estado_aprobacion"] == "Pendiente"

    # Identificar el ítem de pastillas de freno
    frenos_item = next(
        (it for it in dvi["items"] if "pastillas" in it["nombre_item"].lower()),
        dvi["items"][0],
    )
    frenos_item_id = frenos_item["id"]

    # 3. Actualizar ítem a ROJO con observación técnica crítica
    update_item_res = client.patch(
        f"/api/v1/dvi/items/{frenos_item_id}",
        json={
            "estado": "Rojo",
            "observaciones": "Pastillas desgastadas al 10% de vida útil con surcos profundos. Requiere cambio urgente.",
        },
    )
    assert update_item_res.status_code == 200
    updated_item = update_item_res.json()
    assert updated_item["estado"] == "Rojo"
    assert "surcos profundos" in updated_item["observaciones"]

    # 4. Adjuntar evidencia fotográfica al ítem en Rojo
    fake_png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    evidencia_res = client.post(
        f"/api/v1/dvi/items/{frenos_item_id}/evidencias",
        json={
            "tipo_archivo": "foto",
            "archivo_base64": f"data:image/jpeg;base64,{fake_png_base64}",
            "descripcion": "Foto macro del desgaste irregular del compuesto de fricción",
        },
    )
    assert evidencia_res.status_code == 201
    evidencia = evidencia_res.json()
    assert evidencia["id"] is not None
    assert evidencia["item_dvi_id"] == frenos_item_id
    assert "dvi_item_" in evidencia["archivo_path"]

    # 5. Registrar firma digital del cliente y aprobación
    firma_res = client.post(
        f"/api/v1/ordenes-reparacion/{orden_id}/firma",
        json={
            "firma_base64": f"data:image/png;base64,{fake_png_base64}",
            "nombre_firmante": "Roberto Morales",
            "documento_firmante": "V-18765432",
            "aprobado": True,
            "notas": "Autorizo el cambio inmediato de pastillas y el servicio de frenos.",
        },
    )
    assert firma_res.status_code == 200
    dvi_firmado = firma_res.json()
    assert dvi_firmado["estado_aprobacion"] == "Aprobado"
    assert dvi_firmado["nombre_firmante"] == "Roberto Morales"
    assert dvi_firmado["fecha_firma"] is not None
    assert dvi_firmado["firma_cliente"] is not None

    # 6. Compilar y descargar el informe profesional en PDF
    pdf_res = client.get(f"/api/v1/ordenes-reparacion/{orden_id}/reporte-pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert "inline; filename=" in pdf_res.headers["content-disposition"]

    # Verificar que el contenido sea un binario PDF válido (comienza con %PDF-)
    pdf_bytes = pdf_res.content
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")


def test_dvi_orden_inexistente(client: TestClient):
    """
    Verifica que se manejen correctamente los errores 404 al consultar o firmar
    órdenes inexistentes.
    """
    res_get = client.get("/api/v1/dvi/orden/99999")
    assert res_get.status_code == 404

    res_pdf = client.get("/api/v1/ordenes-reparacion/99999/reporte-pdf")
    assert res_pdf.status_code == 404

