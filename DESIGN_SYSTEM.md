# TallerMoto Pro — Sistema de diseño

Fuente única de verdad visual para la web (`frontend/`) y la app móvil (`mobile/`).

## Marca
- Concepto: taller de motos moderno — grafito profundo + acento naranja "ignición".
- Tipografía: **Inter** (web vía Google Fonts; en móvil se usa la fuente del sistema con los mismos pesos).
- Iconografía: lucide (web). En móvil, evitar emojis como iconos principales cuando haya alternativa; si se usan, que sean consistentes.

## Colores

### Marca (`brand`) — reemplaza al índigo en la web
| token | hex |
|---|---|
| brand-50  | #fff5ed |
| brand-100 | #ffe8d4 |
| brand-200 | #ffcda8 |
| brand-300 | #ffa970 |
| brand-400 | #ff7a37 |
| brand-500 | #fd5a12 |
| brand-600 | #ee4008 |
| brand-700 | #c52e09 |
| brand-800 | #9c2610 |
| brand-900 | #7e2310 |

### Neutros (grafito)
| token | hex | uso |
|---|---|---|
| ink-950 | #0b0d12 | sidebar / cabecera oscura |
| ink-900 | #12151c | superficies oscuras |
| ink-800 | #1c212b | tarjetas sobre oscuro |
| ink-700 | #2a303c | bordes sobre oscuro |
| slate-500 | #64748b | texto secundario |
| slate-400 | #94a3b8 | texto terciario |
| slate-200 | #e2e8f0 | bordes |
| slate-100 | #f1f5f9 | fondos sutiles |
| canvas    | #f6f7f9 | fondo de app |
| surface   | #ffffff | tarjetas |
| text      | #0f172a | texto principal |

### Semánticos / estados de orden
| estado | color | fondo suave | texto |
|---|---|---|---|
| En Espera       | slate   #64748b | #f1f5f9 | #334155 |
| En Diagnóstico  | sky     #0284c7 | #e0f2fe | #075985 |
| En Reparación   | brand   #ee4008 | #fff5ed | #9c2610 |
| Listo           | emerald #059669 | #ecfdf5 | #065f46 |
| Entregado       | slate   #94a3b8 | #f8fafc | #64748b |
| Éxito  | #059669 | Advertencia | #d97706 | Error | #e11d48 | Info | #0284c7 |

Moneda: USD en esmeralda (#059669), Bs/VES en sky (#0284c7), EUR en violeta (#7c3aed).

## Forma y ritmo
- Radios: 8 (controles), 12 (tarjetas pequeñas), 16 (tarjetas), 24 (hojas/modales), pill (999).
- Espaciado base 4: 4 / 8 / 12 / 16 / 20 / 24 / 32.
- Sombras: suaves y frías — `0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.08)`; elevada `0 10px 30px -12px rgba(15,23,42,.25)`.
- Botón primario: fondo brand-600, hover brand-700, texto blanco, peso 600.
- Jerarquía de texto: título de página 22–24/700, sección 15–16/600, cuerpo 14/400, etiqueta 11–12/600 en mayúsculas con tracking.
- Números (montos, KPIs): `tabular-nums` / `fontVariant: ['tabular-nums']`.
