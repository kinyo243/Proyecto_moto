import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { TasasBCV, ResumenCajaHoy, OrdenMovil } from '../types';
import { card, colors, orderStateStyle, radius, spacing, touch, type } from '../theme';

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

  const acciones: {
    key: string;
    tab: 'caja' | 'dvi' | 'inventario';
    emoji: string;
    title: string;
    desc: string;
    bg: string;
  }[] = [
    { key: 'cobro', tab: 'caja', emoji: '💵', title: 'Cobro POS', desc: 'Multimoneda y BCV', bg: colors.successSoft },
    { key: 'dvi', tab: 'dvi', emoji: '📸', title: 'Inspección DVI', desc: 'Checklist con Fotos', bg: colors.infoSoft },
    { key: 'repuestos', tab: 'inventario', emoji: '📦', title: 'Repuestos', desc: 'Ubicación en Pasillo', bg: colors.eurSoft },
    { key: 'cuadre', tab: 'caja', emoji: '📊', title: 'Cuadre Caja', desc: 'Desglose de Formas', bg: colors.primarySoft },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tarjeta Principal: Flujo y Utilidad de Caja */}
      <View style={[card, styles.heroCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cajaStatusPill}>
            <View style={styles.cajaDot} />
            <Text style={styles.cajaStatusText}>Caja activa</Text>
          </View>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('es-VE')}</Text>
        </View>

        <View style={styles.heroRow}>
          <View style={styles.heroLeft}>
            <Text style={type.label}>Ingresos del día</Text>
            <Text style={styles.heroMontoUsd}>
              ${caja.total_ingresos_usd.toFixed(2)}
            </Text>
            <Text style={styles.heroMontoBs}>
              ≈ Bs. {ingresosEnBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.utilidadCard}>
            <Text style={styles.utilidadTitle}>Utilidad neta</Text>
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
            <Text style={[styles.kpiNumber, { color: colors.warning }]}>
              ${caja.creditos_por_cobrar_usd.toFixed(2)}
            </Text>
            <Text style={styles.kpiLabel}>Por cobrar</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiNumber, { color: colors.primary }]}>{ordenes.length}</Text>
            <Text style={styles.kpiLabel}>En patio</Text>
          </View>
        </View>
      </View>

      {/* Módulos de Operación Rápida */}
      <Text style={styles.sectionHeader}>Acciones rápidas</Text>
      <View style={styles.actionsGrid}>
        {acciones.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={[card, styles.actionCard]}
            onPress={() => onNavigate(a.tab)}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={[styles.actionIconBox, { backgroundColor: a.bg }]}>
              <Text style={styles.actionEmoji}>{a.emoji}</Text>
            </View>
            <Text style={styles.actionTitle}>{a.title}</Text>
            <Text style={styles.actionDesc}>{a.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Motos en Bahía / Patio */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionHeader, styles.sectionHeaderInline]}>Motos en proceso hoy</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{ordenes.length} activas</Text>
        </View>
      </View>

      {ordenes.map((ord) => {
        const est = orderStateStyle(ord.estado);
        return (
          <View key={ord.id} style={[card, styles.orderCard]}>
            <View style={[styles.orderAccent, { backgroundColor: est.color }]} />
            <View style={styles.orderHeader}>
              <View style={styles.placaWrapper}>
                <View style={styles.placaPlate}>
                  <Text style={styles.placaText}>{ord.placa}</Text>
                </View>
                <Text style={styles.motoModel}>{ord.marca_modelo}</Text>
              </View>
              <View style={[styles.estadoPill, { backgroundColor: est.bg }]}>
                <View style={[styles.estadoDot, { backgroundColor: est.color }]} />
                <Text style={[styles.estadoText, { color: est.text }]}>{est.label}</Text>
              </View>
            </View>

            <View style={styles.orderFooter}>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName} numberOfLines={1}>{ord.cliente_nombre}</Text>
                <Text style={styles.bahiaInfo}>
                  {ord.numero_orden} · {ord.bahia || 'Patio Central'}
                </Text>
              </View>
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>Presupuesto</Text>
                <Text style={styles.priceValue}>${ord.total_usd.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.gutter,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cajaStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  cajaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  cajaStatusText: {
    color: colors.successText,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  dateText: {
    ...type.caption,
    color: colors.textTertiary,
    ...type.tabular,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  heroLeft: {
    flex: 1,
  },
  heroMontoUsd: {
    ...type.kpiXL,
    marginTop: spacing.xs,
  },
  heroMontoBs: {
    fontSize: 13,
    color: colors.ves,
    fontWeight: '600',
    marginTop: 2,
    ...type.tabular,
  },
  utilidadCard: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'flex-end',
    minWidth: 120,
  },
  utilidadTitle: {
    ...type.label,
    fontSize: 10,
    color: colors.successText,
  },
  utilidadMonto: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.usd,
    marginVertical: 2,
    ...type.tabular,
  },
  margenPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  margenText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.successText,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.slate50,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiNumber: {
    ...type.kpi,
    fontSize: 17,
  },
  kpiLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  kpiDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  sectionHeader: {
    ...type.label,
    marginBottom: spacing.md,
  },
  sectionHeaderInline: {
    marginBottom: 0,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  countBadge: {
    backgroundColor: colors.slate100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate600,
    ...type.tabular,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    marginBottom: spacing.xxl,
  },
  actionCard: {
    width: '48.5%',
    minHeight: touch.min * 2,
    padding: 14,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionTitle: {
    ...type.bodyStrong,
  },
  actionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderCard: {
    marginBottom: spacing.md,
    paddingLeft: spacing.xl,
    overflow: 'hidden',
  },
  orderAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  placaWrapper: {
    flex: 1,
    alignItems: 'flex-start',
  },
  placaPlate: {
    backgroundColor: colors.slate100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  placaText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
    ...type.tabular,
  },
  motoModel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 6,
  },
  estadoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  estadoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
  },
  clientInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  clientName: {
    fontSize: 13,
    color: colors.slate700,
    fontWeight: '600',
  },
  bahiaInfo: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    ...type.label,
    fontSize: 10,
    color: colors.textTertiary,
  },
  priceValue: {
    ...type.kpi,
    fontSize: 16,
    color: colors.usd,
  },
});
