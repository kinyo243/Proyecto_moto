import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import type { TasasBCV, ResumenCajaHoy } from '../types';
import {
  card,
  colors,
  primaryButton,
  primaryButtonText,
  radius,
  spacing,
  touch,
  type,
} from '../theme';

interface CajaScreenProps {
  tasas: TasasBCV | null;
  caja: ResumenCajaHoy;
}

type MetodoPago = 'efectivo_usd' | 'pago_movil' | 'punto' | 'zelle';

const METODOS_POS: { key: MetodoPago; emoji: string; label: string }[] = [
  { key: 'pago_movil', emoji: '📲', label: 'Pago Móvil' },
  { key: 'efectivo_usd', emoji: '💵', label: 'Efectivo $' },
  { key: 'punto', emoji: '💳', label: 'Punto Débito' },
  { key: 'zelle', emoji: '⚡', label: 'Zelle' },
];

export const CajaScreen: React.FC<CajaScreenProps> = ({ tasas, caja }) => {
  const tasaBcv = tasas?.usd || 916.65;
  const [montoCobrarUsd, setMontoCobrarUsd] = useState('45.00');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoPago>('pago_movil');
  const [cobradoExito, setCobradoExito] = useState(false);

  const montoNumUsd = parseFloat(montoCobrarUsd) || 0;
  const equivalenteBs = montoNumUsd * tasaBcv;

  const handleCobro = () => {
    setCobradoExito(true);
    setTimeout(() => setCobradoExito(false), 3000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Tarjeta de Saldo y Cuadre Diario */}
      <View style={[card, styles.cardSpacing]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>Cuadre de caja diario</Text>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>Vigente</Text>
          </View>
        </View>

        <View style={styles.totalDisplay}>
          <Text style={styles.totalLabel}>Total facturado en caja</Text>
          <Text style={styles.totalMontoUsd}>
            ${caja.total_ingresos_usd.toFixed(2)} <Text style={styles.totalMontoCurrency}>USD</Text>
          </Text>
          <View style={styles.bcvConversionPill}>
            <Text style={styles.bcvConversionText}>
              Equivalente BCV: Bs. {(caja.total_ingresos_usd * tasaBcv).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Desglose por método de cobro */}
        <Text style={styles.sectionSubtitle}>Desglose por forma de cobro</Text>

        <View>
          <View style={styles.metodoRow}>
            <View style={styles.metodoLeft}>
              <View style={[styles.metodoIconBox, { backgroundColor: colors.successSoft }]}>
                <Text style={styles.metodoIcon}>💵</Text>
              </View>
              <View style={styles.metodoTextGroup}>
                <Text style={styles.metodoTitle}>Efectivo Dólares ($)</Text>
                <Text style={styles.metodoSub}>Caja física taller</Text>
              </View>
            </View>
            <Text style={[styles.metodoMonto, styles.montoUsd]}>${caja.desglose.efectivo_usd.toFixed(2)}</Text>
          </View>

          <View style={styles.metodoRow}>
            <View style={styles.metodoLeft}>
              <View style={[styles.metodoIconBox, { backgroundColor: colors.infoSoft }]}>
                <Text style={styles.metodoIcon}>📲</Text>
              </View>
              <View style={styles.metodoTextGroup}>
                <Text style={styles.metodoTitle}>Pago Móvil (Bs.)</Text>
                <Text style={styles.metodoSub}>Tasa oficial BCV</Text>
              </View>
            </View>
            <View style={styles.alignRight}>
              <Text style={[styles.metodoMonto, styles.montoVes]}>Bs. {caja.desglose.pago_movil_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.metodoSubNum}>≈ ${(caja.desglose.pago_movil_ves / tasaBcv).toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.metodoRow}>
            <View style={styles.metodoLeft}>
              <View style={[styles.metodoIconBox, { backgroundColor: colors.infoSoft }]}>
                <Text style={styles.metodoIcon}>💳</Text>
              </View>
              <View style={styles.metodoTextGroup}>
                <Text style={styles.metodoTitle}>Punto de Venta / Débito</Text>
                <Text style={styles.metodoSub}>Lote bancario nacional</Text>
              </View>
            </View>
            <View style={styles.alignRight}>
              <Text style={[styles.metodoMonto, styles.montoVes]}>Bs. {caja.desglose.punto_debito_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.metodoSubNum}>≈ ${(caja.desglose.punto_debito_ves / tasaBcv).toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.metodoRow, styles.metodoRowLast]}>
            <View style={styles.metodoLeft}>
              <View style={[styles.metodoIconBox, { backgroundColor: colors.successSoft }]}>
                <Text style={styles.metodoIcon}>⚡</Text>
              </View>
              <View style={styles.metodoTextGroup}>
                <Text style={styles.metodoTitle}>Zelle ($)</Text>
                <Text style={styles.metodoSub}>Depósito internacional</Text>
              </View>
            </View>
            <Text style={[styles.metodoMonto, styles.montoUsd]}>${caja.desglose.zelle_usd.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Módulo de Cobro Rápido POS */}
      <View style={[card, styles.cardSpacing]}>
        <Text style={styles.cardHeaderTitle}>Registrar cobro rápido (POS)</Text>
        <Text style={styles.posDesc}>
          Cálculo al instante a tasa oficial BCV:{' '}
          <Text style={styles.posDescStrong}>{tasaBcv.toFixed(2)} Bs/$</Text>
        </Text>

        <Text style={styles.fieldLabel}>Monto a cobrar ($ USD)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputPrefix}>$</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={montoCobrarUsd}
            onChangeText={setMontoCobrarUsd}
            placeholder="0.00"
            placeholderTextColor={colors.slate400}
            selectionColor={colors.primary}
          />
        </View>

        {/* Cuadro de Conversión en Bolívares */}
        <View style={styles.conversionCard}>
          <Text style={styles.conversionLabel}>Total a cancelar en Bolívares (VES)</Text>
          <Text style={styles.conversionMonto}>
            Bs. {equivalenteBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <Text style={styles.fieldLabel}>Método de pago</Text>
        <View style={styles.metodosGrid}>
          {METODOS_POS.map((m) => {
            const active = metodoSeleccionado === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.metodoGridBtn, active && styles.metodoGridBtnActive]}
                onPress={() => setMetodoSeleccionado(m.key)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={styles.gridEmoji}>{m.emoji}</Text>
                <Text style={[styles.gridText, active && styles.gridTextActive]}>{m.label}</Text>
                {active && <View style={styles.gridCheck} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {cobradoExito && (
          <View style={styles.exitoPill}>
            <Text style={styles.exitoText}>✓ ¡Cobro registrado con éxito en caja!</Text>
          </View>
        )}

        <TouchableOpacity
          style={primaryButton}
          onPress={handleCobro}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={primaryButtonText}>Confirmar y Emitir Recibo</Text>
        </TouchableOpacity>
      </View>
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
  cardSpacing: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardHeaderTitle: {
    ...type.section,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.successText,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  totalDisplay: {
    backgroundColor: colors.slate50,
    borderRadius: radius.sm,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  totalLabel: {
    ...type.label,
    marginBottom: spacing.xs,
  },
  totalMontoUsd: {
    ...type.kpiXL,
  },
  totalMontoCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.usd,
    letterSpacing: 0,
  },
  bcvConversionPill: {
    backgroundColor: colors.infoSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  bcvConversionText: {
    fontSize: 12,
    color: colors.infoText,
    fontWeight: '600',
    ...type.tabular,
  },
  sectionSubtitle: {
    ...type.label,
    marginBottom: spacing.xs,
  },
  metodoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  metodoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  metodoLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metodoTextGroup: {
    flex: 1,
  },
  metodoIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metodoIcon: {
    fontSize: 18,
  },
  metodoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  metodoSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  metodoSubNum: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
    ...type.tabular,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  metodoMonto: {
    ...type.amount,
  },
  montoUsd: {
    color: colors.usd,
  },
  montoVes: {
    color: colors.ves,
  },
  posDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  posDescStrong: {
    fontWeight: '700',
    color: colors.text,
    ...type.tabular,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate700,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.slate300,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    marginBottom: spacing.md,
  },
  inputPrefix: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.usd,
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 10,
    ...type.tabular,
  },
  conversionCard: {
    backgroundColor: colors.infoSoft,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  conversionLabel: {
    fontSize: 12,
    color: colors.infoText,
    fontWeight: '500',
  },
  conversionMonto: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ves,
    marginTop: 2,
    ...type.tabular,
  },
  metodosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metodoGridBtn: {
    width: '48.5%',
    minHeight: 52,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metodoGridBtnActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  gridEmoji: {
    fontSize: 18,
  },
  gridText: {
    flex: 1,
    fontSize: 13,
    color: colors.slate600,
    fontWeight: '500',
  },
  gridTextActive: {
    color: colors.brand[800],
    fontWeight: '700',
  },
  gridCheck: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  exitoPill: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
    minHeight: touch.min,
    justifyContent: 'center',
  },
  exitoText: {
    color: colors.successText,
    fontWeight: '600',
    fontSize: 13,
  },
});
