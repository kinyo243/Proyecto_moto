# TallerMoto Pro - Versión Móvil (Inspirada en Fina Partner)

Aplicación móvil orientada a talleres mecánicos de motocicletas y venta de repuestos, diseñada con la filosofía y dinamismo operativo de **Fina Partner** (control multimoneda en Venezuela, cierre de caja diario, cuentas por cobrar, catálogo de repuestos con ubicación exacta en pasillo/estante e inspección técnica DVI en patio).

---

## 🚀 Características Principales (Estilo Fina)

1. **Ticker BCV Oficial en Tiempo Real:**
   - USD ($) y EUR (€) siempre visibles en la parte superior.
   - Conexión directa a tu propio API en FastAPI (`/api/v1/bcv/tasas`).
   - Conversión instantánea entre Dólares y Bolívares.

2. **Cierre de Caja y Flujo Diario:**
   - Apertura y cuadre diario de caja.
   - Desglose transparente por método de cobro: **Efectivo $**, **Pago Móvil (Bs)**, **Punto de Venta / Débito**, **Zelle** y **Transferencias**.
   - Cálculo automático de **utilidad neta estimada** del día.

3. **Catálogo de Repuestos con Ubicación en Taller:**
   - Búsqueda ágil por código de parte o descripción.
   - **Ubicación física exacta:** Pasillo, Estante, Gaveta o Mostrador.
   - Alerta visual de stock mínimo y crítico.
   - Visualización de Costo vs. Precio de Venta y porcentaje de margen.

4. **Inspección Técnica DVI en Patio:**
   - Realizada por el mecánico directamente con su teléfono en la bahía de trabajo.
   - Semáforo interactivo (Verde = Buen estado, Amarillo = Advertencia, Rojo = Crítico).
   - Captura de fotos de evidencia técnica.

---

## 📱 Cómo Ejecutar la App Móvil

### Requisitos:
- Node.js v18+ (instalado).
- Celular Android o iPhone con la aplicación gratuita **Expo Go** instalada (disponible en Google Play Store y App Store).

### Pasos:

1. Entra a la carpeta móvil:
   ```bash
   cd mobile
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo de Expo:
   ```bash
   npx expo start
   ```

4. **Para probar en tu celular:**
   - Abre la app **Expo Go** en tu teléfono.
   - Escanea el código QR que aparecerá en tu terminal.
   - ¡Listo! La app cargará instantáneamente en tu celular sin necesidad de compilar APK.

5. **Para probar en el navegador web:**
   - Presiona la tecla `w` en la consola.

