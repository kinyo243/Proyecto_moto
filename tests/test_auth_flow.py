import pytest
from fastapi.testclient import TestClient


def test_auth_flujo_login_y_me(client: TestClient):
    # 1. Registrar un nuevo usuario
    reg_res = client.post(
        "/api/v1/auth/registro",
        json={
            "email": "asesor@taller.com",
            "nombre_completo": "Juan Asesor",
            "password": "seguraPassword123",
            "rol": "recepcionista",
        },
    )
    assert reg_res.status_code == 201
    assert reg_res.json()["email"] == "asesor@taller.com"
    assert reg_res.json()["rol"] == "recepcionista"

    # 2. Login con credenciales erróneas
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": "asesor@taller.com", "password": "password_incorrecto"},
    )
    assert bad_login.status_code == 401

    # 3. Login exitoso
    good_login = client.post(
        "/api/v1/auth/login",
        json={"email": "asesor@taller.com", "password": "seguraPassword123"},
    )
    assert good_login.status_code == 200
    token_data = good_login.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["usuario"]["nombre_completo"] == "Juan Asesor"
    token = token_data["access_token"]

    # 4. Consultar /auth/me sin token -> 401
    no_auth_res = client.get("/api/v1/auth/me")
    assert no_auth_res.status_code == 401

    # 5. Consultar /auth/me con token -> 200 OK
    auth_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert auth_res.status_code == 200
    assert auth_res.json()["email"] == "asesor@taller.com"

