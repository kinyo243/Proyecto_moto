import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { TasasBCV, ResumenCajaHoy, OrdenMovil } from '../types';

interface DashboardScreenProps {
  tasas: TasasBCV | null;
  caja: ResumenCajaHoy;
  ordenes: OrdenMovil[];
  onNavigate: (tab: 'dashboard' | 'caja' | 'ordenes' | 'dvi' | 'inventario') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  tasas,
  caja,
  ordenes,
  onNavigate,
}) => {
  const tasaUsd = tasas?.usd || 916.65;
  const ingresosEnBs = caja.total_ingresos_usd * tasaUsd;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tarjeta Estilo Fina: Caja y Utilidad Real Hoy */}
      <View style={styles.finaCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>BALANCE DE CAJA HOY</Text>
          <View style={styles.badgeEstado}>
            <Text style={styles.badgeEstadoText}>🟢 CAJA ABIERTA</Text>
          </View>
        </View>

        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.labelSub}>Total Cobrado (USD)</Text>
            <Text style={styles.montoPrincipal}>
              ${caja.total_ingresos_usd.toFixed(2)}
            </Text>
            <Text style={styles.montoSecundario}>
              ≈ Bs. {ingresosEnBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.utilidadBox}>
            <Text style={styles.utilidadLabel}>Utilidad Estimada</Text>
            <Text style={styles.utilidadValor}>
              +${caja.utilidad_estimada_usd.toFixed(2)}
            </Text>
            <Text style={styles.utilidadSub}>Margen neto 41%</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.kpiRow}>
          <View style={styles.kpiCol}>
            <Text style={styles.kpiLabel}>Cobros Realizados</Text>
            <Text style={styles.kpiValue}>{caja.cantidad_cobros}</Text>
          </View>
          <View style={styles.kpiCol}>
            <Text style={styles.kpiLabel}>Créditos por Cobrar</Text>
            <Text style={[styles.kpiValue, { color: '#f59e0b' }]}>
              ${caja.creditos_por_cobrar_usd.toFixed(2)}
            </Text>
          </View>
          <View style={styles.kpiCol}>
            <Text style={styles.kpiLabel}>Motos en Patio</Text>
            <Text style={[styles.kpiValue, { color: '#3b82f6' }]}>{ordenes.length}</Text>
          </View>
        </View>
      </View>

      {/* Botones de Acción Rápida */}
      <Text style={styles.sectionHeader}>ACCIONES RÁPIDAS (OPERACIÓN & FINANZAS)</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#2563eb' }]}
          onPress={() => onNavigate('caja')}
        >
          <Text style={styles.actionIcon}>💵</Text>
          <Text style={styles.actionTitle}>Cobro Rápido POS</Text>
          <Text style={styles.actionSub}>Multimoneda y BCV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#059669' }]}
          onPress={() => onNavigate('dvi')}
        >
          <Text style={styles.actionIcon}>📸</Text>
          <Text style={styles.actionTitle}>Inspección DVI</Text>
          <Text style={styles.actionSub}>Checklist y Fotos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#4f46e5' }]}
          onPress={() => onNavigate('inventario')}
        >
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionTitle}>Repuestos y Stock</Text>
          <Text style={styles.actionSub}>Ver Pasillo y Estante</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#d97706' }]}
          onPress={() => onNavigate('ordenes')}
        >
          <Text style={styles.actionIcon}>🏍️</Text>
          <Text style={styles.actionTitle}>Órdenes Activas</Text>
          <Text style={styles.actionSub}>Estado en Bahías</Text>
        </TouchableOpacity>
      </View>

      {/* Órdenes Recientes en Patio */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionHeader}>MOTOS EN PROCESO HOY</Text>
        <TouchableOpacity onPress={() => onNavigate('ordenes')}>
          <Text style={styles.verMasLink}>Ver todas →</Text>
        </TouchableOpacity>
      </View>

      {ordenes.map((ord) => (
        <View key={ord.id} style={styles.orderCard}>
          <View style={styles.orderTop}>
            <View>
              <Text style={styles.orderPlaca}>{ord.placa}</Text>
              <Text style={styles.orderModel}>{ord.marca_modelo}</Text>
            </View>
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>{ord.estado.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.orderBottom}>
            <Text style={styles.orderClient}>👤 {ord.cliente_nombre}</Text>
            <Text style={styles.orderTotal}>Presupuesto: ${ord.total_usd.toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  finaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  badgeEstado: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  badgeEstadoText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelSub: {
    fontSize: 12,
    color: '#64748b',
  },
  montoPrincipal: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  montoSecundario: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
  utilidadBox: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 12,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  utilidadLabel: {
    fontSize: 10,
    color: '#15803d',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  utilidadValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  utilidadSub: {
    fontSize: 9,
    color: '#65a30d',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  kpiCol: {
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  verMasLink: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderPlaca: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  orderModel: {
    fontSize: 12,
    color: '#64748b',
  },
  orderBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  orderBadgeText: {
    color: '#2563eb',
    fontSize: 9,
    fontWeight: 'bold',
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 8,
  },
  orderClient: {
    fontSize: 11,
    color: '#475569',
  },
  orderTotal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});

