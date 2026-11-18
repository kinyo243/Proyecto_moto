import re
import httpx
from datetime import datetime
from typing import Optional, Dict, Any

BCV_URL = "https://www.bcv.org.ve/"

# Cache en memoria para no saturar al portal del BCV
_cache_tasas: Optional[Dict[str, Any]] = None
_cache_timestamp: Optional[datetime] = None
CACHE_TTL_SECONDS = 600  # 10 minutos


def _parse_monto(texto: str) -> float:
    """Convierte números venezolanos con puntos de miles y comas decimales (ej. 1.007,38665582) a float."""
    # Eliminar espacios y puntos de miles
    limpio = texto.strip().replace(".", "").replace(",", ".")
    return float(limpio)


def fetch_tasas_bcv(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Obtiene las tasas oficiales vigentes del Banco Central de Venezuela (BCV)
    mediante scraping del portal oficial https://www.bcv.org.ve/
    """
    global _cache_tasas, _cache_timestamp

    now = datetime.now()
    if not force_refresh and _cache_tasas and _cache_timestamp:
        segundos = (now - _cache_timestamp).total_seconds()
        if segundos < CACHE_TTL_SECONDS:
            return {**_cache_tasas, "cached": True, "antiguedad_segundos": int(segundos)}

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9",
    }

    try:
        # Se usa verify=False porque el portal del BCV a menudo presenta cadenas SSL con certificados locales
        response = httpx.get(BCV_URL, headers=headers, verify=False, timeout=12.0)
        response.raise_for_status()
        html = response.text

        # Extraer Dólar (USD)
        usd_val = None
        dolar_match = re.search(
            r'id=["\']dolar["\'].*?<strong[^>]*>\s*([0-9\.,]+)\s*</strong>',
            html,
            re.IGNORECASE | re.DOTALL,
        )
        if dolar_match:
            usd_val = _parse_monto(dolar_match.group(1))

        # Extraer Euro (EUR)
        eur_val = None
        euro_match = re.search(
            r'id=["\']euro["\'].*?<strong[^>]*>\s*([0-9\.,]+)\s*</strong>',
            html,
            re.IGNORECASE | re.DOTALL,
        )
        if euro_match:
            eur_val = _parse_monto(euro_match.group(1))

        # Extraer Fecha Valor
        fecha_valor = None
        fecha_match = re.search(
            r'Fecha Valor:.*?<span[^>]*class=["\']date-display-single["\'][^>]*>(.*?)</span>',
            html,
            re.IGNORECASE | re.DOTALL,
        )
        if fecha_match:
            fecha_valor = re.sub(r'\s+', ' ', fecha_match.group(1)).strip()

        if usd_val is None or eur_val is None:
            raise ValueError("No se pudieron extraer los valores de USD o EUR del portal del BCV.")

        resultado = {
            "fuente": "Banco Central de Venezuela (BCV)",
            "url": BCV_URL,
            "usd": usd_val,
            "eur": eur_val,
            "fecha_valor": fecha_valor,
            "consultado_en": now.isoformat(),
            "cached": False,
        }

        _cache_tasas = resultado
        _cache_timestamp = now
        return resultado

    except Exception as exc:
        # Si falla y hay cache previo, retornar el cache aunque haya expirado con aviso
        if _cache_tasas:
            return {
                **_cache_tasas,
                "cached": True,
                "aviso": f"Usando última tasa conocida tras fallo de conexión: {str(exc)}",
            }
        raise exc

