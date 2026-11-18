import base64
import pytest
from fastapi.testclient import TestClient


def test_registro_bahias_y_camaras(client: TestClient):
    """
    Verifica la creación de bahías de trabajo y el registro de cámaras RTSP.
    """
    # 1. Crear una bahía de trabajo
    bahia_res = client.post(
        "/api/v1/bahias",
        json={
            "nombre_bahia": "Bahía 1 - Elevador Principal",
            "descripcion": "Elevador hidráulico para motos de alto cilindraje y banco de herramientas",
        },
    )
    assert bahia_res.status_code == 201
    bahia = bahia_res.json()
    assert bahia["id"] is not None
    assert bahia["nombre_bahia"] == "Bahía 1 - Elevador Principal"
    bahia_id = bahia["id"]

    # 2. Intento de crear bahía con nombre duplicado (debe dar 409 Conflict)
    dup_res = client.post(
        "/api/v1/bahias",
        json={"nombre_bahia": "Bahía 1 - Elevador Principal"},
    )
    assert dup_res.status_code == 409

    # 3. Registrar cámara asociada a la bahía con POST /api/v1/camaras
    camara_payload = {
        "bahia_id": bahia_id,
        "url_rtsp": "rtsp://admin:secure_pass@192.168.1.101:554/h264Preview_01_main",
        "estado": "Activa",
    }
    camara_res = client.post("/api/v1/camaras", json=camara_payload)
    assert camara_res.status_code == 201
    camara = camara_res.json()
    assert camara["id"] is not None
    assert camara["bahia_id"] == bahia_id
    assert camara["estado"] == "Activa"
    assert "bahia_1_cam_" in camara["stream_name"]
    assert "/whep" in camara["webrtc_whep_url"]
    camara_id = camara["id"]

    # 4. Validar formato de URL RTSP (debe rechazar http:// con 422)
    bad_cam_res = client.post(
        "/api/v1/camaras",
        json={"bahia_id": bahia_id, "url_rtsp": "http://192.168.1.101/video"},
    )
    assert bad_cam_res.status_code == 422

    # 5. Validar registro para bahía inexistente (debe dar 404)
    bad_bahia_res = client.post(
        "/api/v1/camaras",
        json={"bahia_id": 99999, "url_rtsp": "rtsp://camera.local/stream"},
    )
    assert bad_bahia_res.status_code == 404


def test_captura_foto_inspeccion_en_bahia(client: TestClient):
    """
    Verifica el flujo de captura rápida de fotograma:
    - Crear bahía y cámara
    - Crear cliente, vehículo y orden activa asignada a esa bahía
    - Tomar foto de inspección mediante /bahias/{id}/captura
    - Validar que quede adjunta a la orden activa en esa bahía
    """
    # 1. Crear bahía y cámara
    b_res = client.post("/api/v1/bahias", json={"nombre_bahia": "Bahía 2 - Diagnóstico"})
    bahia_id = b_res.json()["id"]

    c_res = client.post(
        f"/api/v1/bahias/{bahia_id}/camaras",
        json={"bahia_id": bahia_id, "url_rtsp": "rtsp://192.168.1.102:554/live"},
    )
    camara_id = c_res.json()["id"]

    # 2. Intento de captura antes de tener una orden en la bahía (debe dar 400 Bad Request)
    fake_png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    no_or_res = client.post(
        f"/api/v1/bahias/{bahia_id}/captura",
        json={"camara_id": camara_id, "imagen_base64": fake_png_base64, "notas": "Intento sin orden"},
    )
    assert no_or_res.status_code == 400
    assert "no hay ninguna orden" in no_or_res.json()["detail"].lower()

    # 3. Crear cliente, vehículo y orden asignada a la bahía
    cli = client.post("/api/v1/clientes", json={"nombre": "Taller Cliente", "telefono": "+584149991122"}).json()
    veh = client.post(
        "/api/v1/vehiculos",
        json={
            "cliente_id": cli["id"],
            "marca": "Yamaha",
            "modelo": "TMAX 560",
            "anio": 2023,
            "placa": "YAM-560",
            "kilometraje_actual": 4500,
        },
    ).json()

    # Crear OR asignada a la bahía
    orden_res = client.post(
        "/api/v1/ordenes-reparacion",
        json={
            "vehiculo_id": veh["id"],
            "bahia_id": bahia_id,
            "notas_recepcion": "Revisión de frenos delanteros y transmisión",
        },
    )
    assert orden_res.status_code == 201
    orden = orden_res.json()
    orden_id = orden["id"]

    # 4. Tomar foto de inspección desde el streaming (Captura Rápida)
    captura_res = client.post(
        f"/api/v1/bahias/{bahia_id}/captura",
        json={
            "camara_id": camara_id,
            "imagen_base64": f"data:image/jpeg;base64,{fake_png_base64}",
            "notas": "Desgaste evidente en pastillas de freno delanteras",
        },
    )
    assert captura_res.status_code == 201
    evidencia = captura_res.json()

    assert evidencia["id"] is not None
    assert evidencia["orden_id"] == orden_id
    assert evidencia["camara_id"] == camara_id
    assert "inspeccion_or_" in evidencia["archivo_path"]
    assert "Desgaste evidente" in evidencia["notas"]
    assert evidencia["fecha_captura"] is not None

    # 5. Consultar detalle de la bahía y comprobar que muestre la orden activa y su cámara
    bahia_detail = client.get(f"/api/v1/bahias/{bahia_id}").json()
    assert len(bahia_detail["camaras"]) == 1
    assert bahia_detail["orden_activa"] is not None
    assert bahia_detail["orden_activa"]["id"] == orden_id

