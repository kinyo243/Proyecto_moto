def test_endpoint_tasas_bcv(client):
    res = client.get("/api/v1/bcv/tasas")
    assert res.status_code == 200
    data = res.json()
    assert "usd" in data
    assert "eur" in data
    assert data["usd"] > 0
    assert data["eur"] > 0
    assert "Banco Central de Venezuela" in data["fuente"]

