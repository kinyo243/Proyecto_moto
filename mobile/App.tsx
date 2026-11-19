import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderBCV } from './src/components/HeaderBCV';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CajaScreen } from './src/screens/CajaScreen';
import { InventarioScreen } from './src/screens/InventarioScreen';
import { DviScreen } from './src/screens/DviScreen';
import { getTasasBCVMovil } from './src/api/bcv';
import type { TasasBCV, ResumenCajaHoy, OrdenMovil } from './src/types';
import { colors, radius, spacing, shadowRaised, touch } from './src/theme';

type TabType = 'dashboard' | 'caja' | 'ordenes' | 'dvi' | 'inventario';
type TabIconName = 'home' | 'caja' | 'dvi' | 'box';

const TABS: { key: TabType; label: string; icon: TabIconName }[] = [
  { key: 'dashboard', label: 'Inicio', icon: 'home' },
  { key: 'caja', label: 'Caja', icon: 'caja' },
  { key: 'dvi', label: 'DVI', icon: 'dvi' },
  { key: 'inventario', label: 'Repuestos', icon: 'box' },
];

function MainAppContent() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [tasas, setTasas] = useState<TasasBCV | null>(null);
  const [loadingTasas, setLoadingTasas] = useState(false);

  // Datos financieros del día
  const [caja] = useState<ResumenCajaHoy>({
    apertura_fecha: '2026-11-18',
    estado_caja: 'abierta',
    total_ingresos_usd: 385.00,
    total_ingresos_ves: 352910.00,
    utilidad_estimada_usd: 158.50,
    cantidad_cobros: 7,
    creditos_por_cobrar_usd: 120.00,
    desglose: {
      efectivo_usd: 140.00,
      efectivo_ves: 45000.00,
      pago_movil_ves: 185000.00,
      punto_debito_ves: 122910.00,
      zelle_usd: 110.00,
      transferencia_ves: 0.00,
    },
  });

  const [ordenes] = useState<OrdenMovil[]>([
    {
      id: 1,
      numero_orden: 'OR-001',
      placa: 'AA1B22',
      marca_modelo: 'Yamaha MT-03',
      cliente_nombre: 'José Gregorio Silva',
      cliente_telefono: '+58 412 1234567',
      estado: 'en_trabajo',
      bahia: 'Bahía 1',
      total_usd: 115.00,
      saldo_pendiente_usd: 65.00,
      fecha_ingreso: 'Hoy, 09:30 AM',
    },
    {
      id: 2,
      numero_orden: 'OR-002',
      placa: 'AC8X99',
      marca_modelo: 'Bera SBR 150',
      cliente_nombre: 'Luis Mendoza',
      cliente_telefono: '+58 414 9876543',
      estado: 'dvi_pendiente',
      bahia: 'Bahía 2',
      total_usd: 35.00,
      saldo_pendiente_usd: 35.00,
      fecha_ingreso: 'Hoy, 11:15 AM',
    },
  ]);

  const cargarTasas = async (force = false) => {
    try {
      setLoadingTasas(true);
      const data = await getTasasBCVMovil(force);
      setTasas(data);
    } catch {
      // Fallback local oficial
      setTasas({
        fuente: 'Banco Central de Venezuela',
        url: 'https://www.bcv.org.ve/',
        usd: 916.65,
        eur: 1007.39,
        fecha_valor: '18 Noviembre 2026',
        consultado_en: new Date().toISOString(),
        cached: true,
      });
    } finally {
      setLoadingTasas(false);
    }
  };

  useEffect(() => {
    cargarTasas();
  }, []);

  // Inset inferior seguro: protege contra la barra de botones nativa de Android y el home bar de iOS
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16);
  // Inset superior seguro: protege contra el notch o agujero de cámara
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 16) : 16);

  return (
    <View style={[styles.rootContainer, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" />

      {/* Cabecera grafito con marca */}
      <View style={styles.topHeader}>
        <View style={styles.brandGroup}>
          <View style={styles.brandMark}>
            <View style={styles.brandMarkGlow} />
            <Text style={styles.brandMarkText}>TM</Text>
          </View>
          <View>
            <Text style={styles.appTitle}>
              TallerMoto <Text style={styles.appTitleAccent}>Pro</Text>
            </Text>
            <Text style={styles.appSubtitle}>Gestión del taller</Text>
          </View>
        </View>
      </View>

      {/* Ticker BCV Oficial (USD / EUR) Siempre Visible */}
      <HeaderBCV
        tasas={tasas}
        loading={loadingTasas}
        onRefresh={() => cargarTasas(true)}
      />

      {/* Pantalla activa */}
      <View style={styles.mainContent}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            tasas={tasas}
            caja={caja}
            ordenes={ordenes}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'caja' && (
          <CajaScreen tasas={tasas} caja={caja} />
        )}
        {activeTab === 'inventario' && (
          <InventarioScreen tasas={tasas} />
        )}
        {activeTab === 'dvi' && (
          <DviScreen />
        )}
        {activeTab === 'ordenes' && (
          <DashboardScreen
            tasas={tasas}
            caja={caja}
            ordenes={ordenes}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
      </View>

      {/* Barra de Navegación Inferior con Margen Seguro (Anti-Solapamiento) */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPadding }]}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const tint = active ? colors.primary : colors.slate400;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabBtn}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
            >
              <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
              <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
                <TabIcon name={tab.icon} color={tint} />
              </View>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** Iconos de pestaña dibujados con Views (sin librerías de iconos). */
function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  if (name === 'home') {
    return (
      <View style={iconStyles.frame}>
        <View style={iconStyles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[iconStyles.gridCell, { borderColor: color }, i === 0 && { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>
    );
  }
  if (name === 'caja') {
    return (
      <View style={iconStyles.frame}>
        <View style={[iconStyles.bill, { borderColor: color }]}>
          <View style={[iconStyles.billCoin, { borderColor: color }]} />
        </View>
      </View>
    );
  }
  if (name === 'dvi') {
    return (
      <View style={iconStyles.frame}>
        <View style={[iconStyles.cameraBump, { backgroundColor: color }]} />
        <View style={[iconStyles.cameraBody, { borderColor: color }]}>
          <View style={[iconStyles.cameraLens, { borderColor: color }]} />
        </View>
      </View>
    );
  }
  return (
    <View style={iconStyles.frame}>
      <View style={[iconStyles.boxBody, { borderColor: color }]}>
        <View style={[iconStyles.boxLid, { backgroundColor: color }]} />
        <View style={[iconStyles.boxHandle, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainAppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.ink950,
  },
  topHeader: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.ink950,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandMarkGlow: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand[400],
  },
  brandMarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
  appTitleAccent: {
    color: colors.brand[400],
  },
  appSubtitle: {
    fontSize: 12,
    color: colors.slate400,
    fontWeight: '500',
    marginTop: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-around',
    ...shadowRaised,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: touch.min + 12,
    paddingBottom: spacing.xs,
  },
  tabIndicator: {
    width: 28,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  tabIndicatorActive: {
    backgroundColor: colors.primary,
  },
  iconWrapper: {
    width: 52,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapperActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.slate400,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

const iconStyles = StyleSheet.create({
  frame: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  gridCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
    borderWidth: 1.75,
  },
  bill: {
    width: 20,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billCoin: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  cameraBump: {
    width: 8,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginBottom: -1,
  },
  cameraBody: {
    width: 20,
    height: 15,
    borderRadius: 4,
    borderWidth: 1.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  boxBody: {
    width: 18,
    height: 17,
    borderRadius: 3,
    borderWidth: 1.75,
    alignItems: 'center',
    overflow: 'hidden',
  },
  boxLid: {
    width: '100%',
    height: 1.75,
    marginTop: 4,
  },
  boxHandle: {
    width: 6,
    height: 1.75,
    borderRadius: 1,
    marginTop: 3,
  },
});
