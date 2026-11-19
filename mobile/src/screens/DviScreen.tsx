import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { ItemDviMovil } from '../types';
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

const ITEMS_INICIALES: ItemDviMovil[] = [
  { id: 1, categoria: 'Frenos', nombre: 'Pastillas y Discos Delanteros', estado: 'sin_evaluar' },
  { id: 2, categoria: 'Frenos', nombre: 'Líquido de Frenos y Maneta', estado: 'sin_evaluar' },
  { id: 3, categoria: 'Neumáticos', nombre: 'Desgaste y Presión Delantera', estado: 'sin_evaluar' },
  { id: 4, categoria: 'Neumáticos', nombre: 'Desgaste y Presión Trasera', estado: 'sin_evaluar' },
  { id: 5, categoria: 'Fluidos', nombre: 'Nivel y Estado de Aceite Motor', estado: 'sin_evaluar' },
  { id: 6, categoria: 'Transmisión', nombre: 'Tensión y Lubricación de Cadena', estado: 'sin_evaluar' },
  { id: 7, categoria: 'Suspensión', nombre: 'Retenes y Barras Delanteras', estado: 'sin_evaluar' },
];

type Semaforo = 'verde' | 'amarillo' | 'rojo';

/** Tonos del semáforo DVI según los colores semánticos del sistema. */
const SEMAFORO: Record<Semaforo, { label: string; color: string; bg: string; border: string; text: string }> = {
  verde: {
    label: 'Bueno',
    color: colors.success,
    bg: colors.successSoft,
    border: colors.successBorder,
    text: colors.successText,
  },
  amarillo: {
    label: 'Atención',
    color: colors.warning,
    bg: colors.warningSoft,
    border: colors.warningBorder,
    text: colors.warningText,
  },
  rojo: {
    label: 'Crítico',
    color: colors.danger,
    bg: colors.dangerSoft,
    border: colors.dangerBorder,
    text: colors.dangerText,
  },
};

const SEMAFORO_ORDEN: Semaforo[] = ['verde', 'amarillo', 'rojo'];

export const DviScreen: React.FC = () => {
  const [items, setItems] = useState<ItemDviMovil[]>(ITEMS_INICIALES);
  const [ordenSeleccionada] = useState('OR-001 • Yamaha MT-03 (AA1B22)');
  const [guardadoExito, setGuardadoExito] = useState(false);

  const cambiarEstado = (id: number, nuevoEstado: 'verde' | 'amarillo' | 'rojo') => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, estado: nuevoEstado } : it))
    );
  };

  const totalVerde = items.filter((i) => i.estado === 'verde').length;
  const totalAmarillo = items.filter((i) => i.estado === 'amarillo').length;
  const totalRojo = items.filter((i) => i.estado === 'rojo').length;
  const evaluados = items.filter((i) => i.estado !== 'sin_evaluar').length;

  const handleGuardar = () => {
    setGuardadoExito(true);
    setTimeout(() => setGuardadoExito(false), 3000);
  };

  const resumen: { key: Semaforo; total: number; label: string }[] = [
    { key: 'verde', total: totalVerde, label: 'Óptimo' },
    { key: 'amarillo', total: totalAmarillo, label: 'Atención' },
    { key: 'rojo', total: totalRojo, label: 'Urgente' },
  ];

  const progreso = items.length > 0 ? evaluados / items.length : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Resumen Superior de Inspección */}
      <View style={[card, styles.headerCard]}>
        <View style={styles.topRow}>
          <Text style={styles.headerLabel}>Inspección digital en bahía</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{evaluados}/{items.length} evaluados</Text>
          </View>
        </View>

        <Text style={styles.ordenTitle}>{ordenSeleccionada}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progreso * 100}%` }]} />
        </View>

        <View style={styles.semaforoSummary}>
          {resumen.map((r) => {
            const tone = SEMAFORO[r.key];
            return (
              <View key={r.key} style={[styles.summaryPill, { backgroundColor: tone.bg, borderColor: tone.border }]}>
                <Text style={[styles.summaryNumber, { color: tone.color }]}>{r.total}</Text>
                <Text style={[styles.summaryLabel, { color: tone.text }]}>{r.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Checklist de revisión técnica</Text>

      {items.map((item) => (
        <View key={item.id} style={[card, styles.itemCard]}>
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderText}>
              <Text style={styles.itemCat}>{item.categoria}</Text>
              <Text style={styles.itemName}>{item.nombre}</Text>
            </View>
            {item.estado !== 'sin_evaluar' && (
              <View style={[styles.itemStatusDot, { backgroundColor: SEMAFORO[item.estado].color }]} />
            )}
          </View>

          {/* Botones de semáforo interactivo */}
          <View style={styles.semaforoRow}>
            {SEMAFORO_ORDEN.map((key) => {
              const tone = SEMAFORO[key];
              const active = item.estado === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.btnSemaforo,
                    active && { backgroundColor: tone.bg, borderColor: tone.color },
                  ]}
                  onPress={() => cambiarEstado(item.id, key)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <View style={[styles.semaforoDot, { backgroundColor: tone.color }]} />
                  <Text style={[styles.semaforoText, active && { color: tone.text, fontWeight: '700' }]}>
                    {tone.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botón de Captura de Foto con Cámara */}
          <TouchableOpacity style={styles.fotoBtn} activeOpacity={0.7} accessibilityRole="button">
            <Text style={styles.fotoIcon}>📸</Text>
            <Text style={styles.fotoText}>Adjuntar foto de evidencia</Text>
          </TouchableOpacity>
        </View>
      ))}

      {guardadoExito && (
        <View style={styles.exitoPill}>
          <Text style={styles.exitoText}>✓ ¡Inspección guardada y lista para PDF/WhatsApp!</Text>
        </View>
      )}

      <TouchableOpacity
        style={primaryButton}
        onPress={handleGuardar}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Text style={primaryButtonText}>Finalizar y Compartir Diagnóstico</Text>
      </TouchableOpacity>
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
  headerCard: {
    marginBottom: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerLabel: {
    ...type.label,
    flexShrink: 1,
  },
  progressBadge: {
    backgroundColor: colors.slate100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate600,
    ...type.tabular,
  },
  ordenTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.slate100,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  semaforoSummary: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    ...type.tabular,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  sectionTitle: {
    ...type.label,
    marginBottom: spacing.md,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  itemHeaderText: {
    flex: 1,
  },
  itemStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  itemCat: {
    ...type.label,
    fontSize: 10,
    color: colors.textTertiary,
  },
  itemName: {
    ...type.section,
    marginTop: 2,
  },
  semaforoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  btnSemaforo: {
    flex: 1,
    flexDirection: 'row',
    minHeight: touch.min,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  semaforoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  semaforoText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate600,
  },
  fotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touch.min,
    borderRadius: radius.sm,
    backgroundColor: colors.slate50,
    borderWidth: 1.5,
    borderColor: colors.slate300,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  fotoIcon: {
    fontSize: 14,
  },
  fotoText: {
    fontSize: 13,
    color: colors.slate600,
    fontWeight: '500',
  },
  exitoPill: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  exitoText: {
    color: colors.successText,
    fontWeight: '600',
    fontSize: 13,
  },
});
