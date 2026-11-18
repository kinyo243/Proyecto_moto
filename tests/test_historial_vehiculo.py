def test_historial_clinico_vehiculo_por_placa(client):
    # 1. Crear cliente
    c_res = client.post(
        "/api/v1/clientes",
        json={
            "nombre": "Ana Morales",
            "telefono": "+525511223344",
            "email": "ana@historial.com",
            "tipo": "regular",
        },
    )
    cliente_id = c_res.json()["id"]

    # 2. Registrar vehículo con placa única
    v_res = client.post(
        "/api/v1/vehiculos",
        json={
            "cliente_id": cliente_id,
            "marca": "Kawasaki",
            "modelo": "Ninja 400",
            "anio": 2024,
            "placa": "KAWA-400-Z",
            "kilometraje_actual": 3200,
            "nivel_combustible": "3/4",
        },
    )
    assert v_res.status_code == 201

    # 3. Crear 2 órdenes para el mismo vehículo
    o1 = client.post(
        "/api/v1/ordenes-reparacion",
        json={"vehiculo_id": v_res.json()["id"], "notas_recepcion": "Primer servicio de 1000 km"},
    )
    assert o1.status_code == 201

    # 4. Consultar historial clínico por placa
    hist_res = client.get("/api/v1/vehiculos/placa/KAWA-400-Z/historial")
    assert hist_res.status_code == 200
    data = hist_res.json()
    assert data["placa"] == "KAWA-400-Z"
    assert data["cliente"]["nombre"] == "Ana Morales"
    assert len(data["ordenes_reparacion"]) >= 1
    assert data["ordenes_reparacion"][0]["notas_recepcion"] == "Primer servicio de 1000 km"
