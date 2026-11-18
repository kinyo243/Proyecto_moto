import pytest
from fastapi.testclient import TestClient


def test_flujo_presupuesto_items_y_pagos(client: TestClient):
    # 1. Crear cliente
    cli_resp = client.post(
        "/api/v1/clientes",
        json={
            "nombre": "Roberto Sanchez",
            "telefono": "+525544332211",
            "email": "roberto@presupuesto.com",
            "tipo": "regular",
        },
    )
    assert cli_resp.status_code == 201
    cliente_id = cli_resp.json()["id"]

    # 2. Registrar vehículo
    veh_resp = client.post(
        "/api/v1/vehiculos",
        json={
            "cliente_id": cliente_id,
            "marca": "KTM",
            "modelo": "Duke 390",
            "anio": 2022,
            "placa": "KTM-390-X",
            "kilometraje_actual": 8500,
            "nivel_combustible": "1/2",
        },
    )
    assert veh_resp.status_code == 201
    vehiculo_id = veh_resp.json()["id"]

    # 3. Crear orden
    orden_resp = client.post(
        "/api/v1/ordenes-reparacion",
        json={
            "vehiculo_id": vehiculo_id,
            "notas_recepcion": "Revisión 10,000 km y frenos",
        },
    )
    assert orden_resp.status_code == 201
    orden_id = orden_resp.json()["id"]

    # 4. Crear presupuesto
    pres_resp = client.post(
        "/api/v1/presupuestos",
        json={
            "orden_id": orden_id,
            "impuesto_porcentaje": 16.0,
            "descuento": 100.0,
            "notas": "Presupuesto inicial preventivo",
        },
    )
    assert pres_resp.status_code == 201
    presupuesto_id = pres_resp.json()["id"]
    assert pres_resp.json()["descuento"] == 100.0

    # 5. Agregar ítems al presupuesto
    # Repuesto: Pastillas
    item1_resp = client.post(
        f"/api/v1/presupuestos/{presupuesto_id}/items",
        json={
            "tipo": "Repuesto",
            "descripcion": "Pastillas Brembo Delanteras",
            "cantidad": 2.0,
            "precio_unitario": 450.0,  # 900.0
        },
    )
    assert item1_resp.status_code == 201
    assert item1_resp.json()["subtotal"] == 900.0

    # Mano de obra
    item2_resp = client.post(
        f"/api/v1/presupuestos/{presupuesto_id}/items",
        json={
            "tipo": "Mano de Obra",
            "descripcion": "Instalación y purgado de frenos",
            "cantidad": 1.0,
            "precio_unitario": 350.0,  # 350.0
        },
    )
    assert item2_resp.status_code == 201

    # 6. Consultar presupuesto y verificar totales
    # Subtotal bruto = 900 + 350 = 1250
    # Descuento = 100 -> Base = 1150
    # IVA (16%) = 1150 * 0.16 = 184.0
    # Total = 1150 + 184 = 1334.0
    pres_consult = client.get(f"/api/v1/presupuestos/orden/{orden_id}")
    assert pres_consult.status_code == 200
    p_data = pres_consult.json()
    assert len(p_data["items"]) == 2
    assert p_data["subtotal_bruto"] == 1250.0
    assert p_data["monto_impuesto"] == 184.0
    assert p_data["total"] == 1334.0

    # 7. Consultar balance inicial (sin pagos)
    bal1 = client.get(f"/api/v1/presupuestos/orden/{orden_id}/balance")
    assert bal1.status_code == 200
    assert bal1.json()["total_presupuesto"] == 1334.0
    assert bal1.json()["total_pagado"] == 0.0
    assert bal1.json()["saldo_pendiente"] == 1334.0
    assert bal1.json()["estado_pago"] == "Pendiente"

    # 8. Registrar abono parcial ($500)
    pago1_resp = client.post(
        "/api/v1/presupuestos/pagos",
        json={
            "orden_id": orden_id,
            "monto": 500.0,
            "metodo_pago": "Efectivo",
            "notas": "Anticipo para repuestos",
        },
    )
    assert pago1_resp.status_code == 201

    bal2 = client.get(f"/api/v1/presupuestos/orden/{orden_id}/balance")
    assert bal2.json()["total_pagado"] == 500.0
    assert bal2.json()["saldo_pendiente"] == 834.0
    assert bal2.json()["estado_pago"] == "Parcialmente Pagado"

    # 9. Liquidar saldo restante ($834)
    pago2_resp = client.post(
        "/api/v1/presupuestos/pagos",
        json={
            "orden_id": orden_id,
            "monto": 834.0,
            "metodo_pago": "Tarjeta Débito",
            "referencia": "AUTH-998822",
        },
    )
    assert pago2_resp.status_code == 201

    bal3 = client.get(f"/api/v1/presupuestos/orden/{orden_id}/balance")
    assert bal3.json()["total_pagado"] == 1334.0
    assert bal3.json()["saldo_pendiente"] == 0.0
    assert bal3.json()["estado_pago"] == "Pagado Total"

