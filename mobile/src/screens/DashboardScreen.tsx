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
      {/* Tarjeta Principal: Flujo y Utilidad de Caja */}
      <View style={styles.mainHeroCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cajaStatusPill}>
            <Text style={styles.cajaDot}>●</Text>
            <Text style={styles.cajaStatusText}>CAJA ACTIVA</Text>
          </View>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('es-VE')}</Text>
        </View>

        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroSubLabel}>Ingresos del Día</Text>
            <Text style={styles.heroMontoUsd}>
              ${caja.total_ingresos_usd.toFixed(2)}
            </Text>
            <Text style={styles.heroMontoBs}>
              ≈ Bs. {ingresosEnBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.utilidadCard}>
            <Text style={styles.utilidadTitle}>UTILIDAD NETA</Text>
            <Text style={styles.utilidadMonto}>+${caja.utilidad_estimada_usd.toFixed(2)}</Text>
            <View style={styles.margenPill}>
              <Text style={styles.margenText}>41% Margen</Text>
            </View>
          </View>
        </View>

        {/* Barra de métricas inferiores */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiNumber}>{caja.cantidad_cobros}</Text>
            <Text style={styles.kpiLabel}>Cobros hoy</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiNumber, { color: '#f59e0b' }]}>
              ${caja.creditos_por_cobrar_usd.toFixed(2)}
            </Text>
            <Text style={styles.kpiLabel}>Por cobrar</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiNumber, { color: '#3b82f6' }]}>{ordenes.length}</Text>
            <Text style={styles.kpiLabel}>En patio</Text>
          </View>
        </View>
      </View>

      {/* Módulos de Operación Rápida */}
      <Text style={styles.sectionHeader}>ACCIONES RÁPIDAS DEL TALLER</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigate('caja')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#ecfdf5' }]}>
            <Text style={styles.actionEmoji}>💵</Text>
          </View>
          <Text style={styles.actionTitle}>Cobro POS</Text>
          <Text style={styles.actionDesc}>Multimoneda y BCV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigate('dvi')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
            <Text style={styles.actionEmoji}>📸</Text>
          </View>
          <Text style={styles.actionTitle}>Inspección DVI</Text>
          <Text style={styles.actionDesc}>Checklist con Fotos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigate('inventario')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#faf5ff' }]}>
            <Text style={styles.actionEmoji}>📦</Text>
          </View>
          <Text style={styles.actionTitle}>Repuestos</Text>
          <Text style={styles.actionDesc}>Ubicación en Pasillo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => onNavigate('caja')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#fffbeb' }]}>
            <Text style={styles.actionEmoji}>📊</Text>
          </View>
          <Text style={styles.actionTitle}>Cuadre Caja</Text>
          <Text style={styles.actionDesc}>Desglose de Formas</Text>
        </TouchableOpacity>
      </View>

      {/* Motos en Bahía / Patio */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionHeader}>MOTOS EN PROCESO HOY</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{ordenes.length} activas</Text>
        </View>
      </View>

      {ordenes.map((ord) => (
        <View key={ord.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.placaWrapper}>
              <Text style={styles.placaText}>{ord.placa}</Text>
              <Text style={styles.motoModel}>{ord.marca_modelo}</Text>
            </View>
            <View style={styles.estadoPill}>
              <Text style={styles.estadoText}>{ord.estado.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>👤 {ord.cliente_nombre}</Text>
              <Text style={styles.bahiaInfo}>📍 {ord.bahia || 'Patio Central'}</Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Presupuesto</Text>
              <Text style={styles.priceValue}>${ord.total_usd.toFixed(2)}</Text>
            </View>
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
    paddingBottom: 95,
  },
  mainHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cajaStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  cajaDot: {
    color: '#059669',
    fontSize: 8,
  },
  cajaStatusText: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroSubLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroMontoUsd: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  heroMontoBs: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  utilidadCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 10,
    alignItems: 'flex-end',
    minWidth: 115,
  },
  utilidadTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.5,
  },
  utilidadMonto: {
    fontSize: 20,
    fontWeight: '900',
    color: '#16a34a',
    marginVertical: 1,
  },
  margenPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  margenText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803d',
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  kpiDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  countBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  actionDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  placaWrapper: {
    flex: 1,
  },
  placaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  motoModel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  estadoPill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  estadoText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  bahiaInfo: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
});
