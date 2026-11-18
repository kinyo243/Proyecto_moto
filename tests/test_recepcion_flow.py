import pytest
from fastapi.testclient import TestClient


def test_crear_y_buscar_cliente(client: TestClient):
    """
    Verifica el registro de clientes y la búsqueda en recepción.
    """
    # 1. Registro exitoso de nuevo cliente
    payload = {
        "nombre": "Carlos Mendoza",
        "telefono": "+584141112233",
        "email": "carlos.mendoza@example.com",
        "direccion": "Av. Libertador, Edif. Centro",
        "tipo": "regular",
    }
    response = client.post("/api/v1/clientes", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["nombre"] == "Carlos Mendoza"
    assert data["telefono"] == "+584141112233"
    cliente_id = data["id"]

    # 2. Intento de registro con teléfono duplicado sin flag (debe dar 409 Conflict)
    dup_response = client.post("/api/v1/clientes", json=payload)
    assert dup_response.status_code == 409
    assert "ya existe un cliente" in dup_response.json()["detail"].lower()

    # 3. Uso de get_if_exists=true para recuperar el cliente sin error
    get_exists_response = client.post("/api/v1/clientes?get_if_exists=true", json=payload)
    assert get_exists_response.status_code == 200
    assert get_exists_response.json()["id"] == cliente_id

    # 4. Búsqueda por teléfono en el endpoint de recepción /clientes/buscar
    search_response = client.post("/api/v1/clientes/buscar", json={"telefono": "414111"})
    assert search_response.status_code == 200
    search_results = search_response.json()
    assert len(search_results) == 1
    assert search_results[0]["id"] == cliente_id


def test_asociar_vehiculo_a_cliente(client: TestClient):
    """
    Verifica el registro del vehículo asociado a un cliente con millaje y combustible.
    """
    # Registrar cliente previo
    cliente_res = client.post(
        "/api/v1/clientes",
        json={"nombre": "Taller Moto Club", "telefono": "+584129998877", "tipo": "flotilla"},
    )
    cliente_id = cliente_res.json()["id"]

    # 1. Registro del vehículo
    vehiculo_payload = {
        "cliente_id": cliente_id,
        "marca": "Yamaha",
        "modelo": "MT-07",
        "anio": 2023,
        "placa": "ab123cd",  # En minúscula, debe normalizarse a mayúscula
        "vin": "JYARN071234567890",
        "kilometraje_actual": 14500,
        "nivel_combustible": "1/2",
    }
    vehiculo_res = client.post("/api/v1/vehiculos", json=vehiculo_payload)
    assert vehiculo_res.status_code == 201
    vehiculo_data = vehiculo_res.json()
    assert vehiculo_data["id"] is not None
    assert vehiculo_data["placa"] == "AB123CD"  # Verificación de normalización
    assert vehiculo_data["kilometraje_actual"] == 14500
    assert vehiculo_data["nivel_combustible"] == "1/2"
    assert vehiculo_data["cliente_id"] == cliente_id

    # 2. Validación de cliente inexistente (debe dar 404 Not Found)
    bad_payload = vehiculo_payload.copy()
    bad_payload["cliente_id"] = 9999
    bad_payload["placa"] = "XYZ999"
    bad_res = client.post("/api/v1/vehiculos", json=bad_payload)
    assert bad_res.status_code == 404
    assert "no existe" in bad_res.json()["detail"].lower()

    # 3. Validación de placa duplicada sin update_if_exists (409 Conflict)
    dup_res = client.post("/api/v1/vehiculos", json=vehiculo_payload)
    assert dup_res.status_code == 409
    assert "ya se encuentra registrado" in dup_res.json()["detail"].lower()

    # 4. Actualización de millaje y combustible de ingreso con update_if_exists=true
    update_payload = vehiculo_payload.copy()
    update_payload["kilometraje_actual"] = 16000
    update_payload["nivel_combustible"] = "3/4"
    update_res = client.post("/api/v1/vehiculos?update_if_exists=true", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["kilometraje_actual"] == 16000
    assert updated_data["nivel_combustible"] == "3/4"

    # 5. Inconsistencia de odómetro (kilometraje menor al previo debe dar 400 Bad Request)
    tampered_payload = vehiculo_payload.copy()
    tampered_payload["kilometraje_actual"] = 10000  # Menor a 16000
    tampered_res = client.post("/api/v1/vehiculos?update_if_exists=true", json=tampered_payload)
    assert tampered_res.status_code == 400
    assert "inconsistencia en odómetro" in tampered_res.json()["detail"].lower()


def test_creacion_completa_orden_reparacion_desde_cero(client: TestClient):
    """
    Prueba el flujo completo end-to-end de recepción de vehículo:
    1. Registrar cliente
    2. Registrar/asociar vehículo con kilometraje y combustible de entrada
    3. Crear la Orden de Reparación con estado inicial 'En Espera'
    4. Consultar el detalle completo de la orden con vehículo y cliente anidados
    """
    # 1. Crear cliente
    cli_res = client.post(
        "/api/v1/clientes",
        json={
            "nombre": "Ana Morales",
            "telefono": "+584165554433",
            "email": "ana.morales@example.com",
            "direccion": "Urb. Las Mercedes, Calle 2",
            "tipo": "regular",
        },
    )
    assert cli_res.status_code == 201
    cliente = cli_res.json()

    # 2. Asociar vehículo con kilometraje y nivel de combustible
    veh_res = client.post(
        "/api/v1/vehiculos",
        json={
            "cliente_id": cliente["id"],
            "marca": "Honda",
            "modelo": "CB190R",
            "anio": 2022,
            "placa": "MOT-789",
            "kilometraje_actual": 8200,
            "nivel_combustible": "Reserva",
        },
    )
    assert veh_res.status_code == 201
    vehiculo = veh_res.json()

    # 3. Crear Orden de Reparación (Recepción del taller)
    orden_payload = {
        "vehiculo_id": vehiculo["id"],
        "notas_recepcion": "Mantenimiento preventivo de los 8000km, cambio de aceite y filtro, ajuste de frenos.",
    }
    # Probar endpoint principal /ordenes-reparacion
    orden_res = client.post("/api/v1/ordenes-reparacion", json=orden_payload)
    assert orden_res.status_code == 201
    orden = orden_res.json()

    assert orden["id"] is not None
    assert orden["vehiculo_id"] == vehiculo["id"]
    assert orden["estado"] == "En Espera"  # Estado inicial mandatorio
    assert "8000km" in orden["notas_recepcion"]
    assert orden["fecha_creacion"] is not None

    # 4. Consultar detalle completo de la orden con GET /ordenes-reparacion/{id}
    detail_res = client.get(f"/api/v1/ordenes-reparacion/{orden['id']}")
    assert detail_res.status_code == 200
    detail = detail_res.json()

    # Validar campos de la Orden
    assert detail["id"] == orden["id"]
    assert detail["estado"] == "En Espera"

    # Validar datos anidados del Vehículo
    assert detail["vehiculo"] is not None
    assert detail["vehiculo"]["id"] == vehiculo["id"]
    assert detail["vehiculo"]["placa"] == "MOT-789"
    assert detail["vehiculo"]["marca"] == "Honda"
    assert detail["vehiculo"]["modelo"] == "CB190R"
    assert detail["vehiculo"]["kilometraje_actual"] == 8200
    assert detail["vehiculo"]["nivel_combustible"] == "Reserva"

    # Validar datos anidados del Cliente propietario
    assert detail["vehiculo"]["cliente"] is not None
    assert detail["vehiculo"]["cliente"]["id"] == cliente["id"]
    assert detail["vehiculo"]["cliente"]["nombre"] == "Ana Morales"
    assert detail["vehiculo"]["cliente"]["telefono"] == "+584165554433"

    # Validar acceso de conveniencia al cliente en la raíz
    assert detail["cliente"]["nombre"] == "Ana Morales"


def test_validaciones_orden_reparacion(client: TestClient):
    """
    Verifica las validaciones de negocio y códigos de error en la creación de OR.
    """
    # 1. Error 404 al intentar crear orden para un vehículo que no existe
    bad_or = client.post(
        "/api/v1/ordenes-reparacion",
        json={"vehiculo_id": 99999, "notas_recepcion": "Prueba fallo"},
    )
    assert bad_or.status_code == 404
    assert "no existe" in bad_or.json()["detail"].lower()

    # 2. Registrar cliente y vehículo válidos
    cli = client.post("/api/v1/clientes", json={"nombre": "Pedro", "telefono": "+584241112233"}).json()
    veh = client.post(
        "/api/v1/vehiculos",
        json={
            "cliente_id": cli["id"],
            "marca": "Suzuki",
            "modelo": "GN 125",
            "anio": 2021,
            "placa": "SUZ-001",
            "kilometraje_actual": 5000,
        },
    ).json()

    # Crear primera orden (éxito)
    or1 = client.post(
        "/api/v1/ordenes-reparacion",
        json={"vehiculo_id": veh["id"], "notas_recepcion": "Primera visita"},
    )
    assert or1.status_code == 201

    # 3. Intentar crear una SEGUNDA orden activa para el mismo vehículo (debe dar 409 Conflict)
    or2 = client.post(
        "/api/v1/ordenes-reparacion",
        json={"vehiculo_id": veh["id"], "notas_recepcion": "Segunda orden concurrente"},
    )
    assert or2.status_code == 409
    assert "ya posee una orden activa" in or2.json()["detail"].lower()

    # 4. Error 404 al consultar una orden inexistente
    not_found_res = client.get("/api/v1/ordenes-reparacion/99999")
    assert not_found_res.status_code == 404
    assert "no encontrada" in not_found_res.json()["detail"].lower()
