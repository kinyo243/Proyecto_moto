import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { HeaderBCV } from './src/components/HeaderBCV';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CajaScreen } from './src/screens/CajaScreen';
import { InventarioScreen } from './src/screens/InventarioScreen';
import { DviScreen } from './src/screens/DviScreen';
import { getTasasBCVMovil } from './src/api/bcv';
import type { TasasBCV, ResumenCajaHoy, OrdenMovil } from './src/types';

type TabType = 'dashboard' | 'caja' | 'ordenes' | 'dvi' | 'inventario';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [tasas, setTasas] = useState<TasasBCV | null>(null);
  const [loadingTasas, setLoadingTasas] = useState(false);

  // Datos financieros del día (Estilo Fina)
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Top Navbar Header con Ticker Oficial BCV Siempre Visible */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.appTitle}>TallerMoto Pro</Text>
          <View style={styles.partnerBadge}>
            <Text style={styles.partnerBadgeText}>FINA ENGINE</Text>
          </View>
        </View>
      </View>

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

      {/* Barra de Navegación Inferior (Estilo Fina / Tab Bar) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab('caja')}
        >
          <Text style={styles.tabIcon}>💵</Text>
          <Text style={[styles.tabLabel, activeTab === 'caja' && styles.tabLabelActive]}>
            Caja
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab('dvi')}
        >
          <Text style={styles.tabIcon}>📸</Text>
          <Text style={[styles.tabLabel, activeTab === 'dvi' && styles.tabLabelActive]}>
            DVI
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab('inventario')}
        >
          <Text style={styles.tabIcon}>📦</Text>
          <Text style={[styles.tabLabel, activeTab === 'inventario' && styles.tabLabelActive]}>
            Repuestos
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#0f172a',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  partnerBadge: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  partnerBadgeText: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    paddingBottom: 14,
    justifyContent: 'space-around',
  },
  tabBtn: {
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
});
