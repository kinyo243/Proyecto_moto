import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { ItemDviMovil } from '../types';

const ITEMS_INICIALES: ItemDviMovil[] = [
  { id: 1, categoria: 'Frenos', nombre: 'Pastillas y Discos Delanteros', estado: 'sin_evaluar' },
  { id: 2, categoria: 'Frenos', nombre: 'Líquido de Frenos y Maneta', estado: 'sin_evaluar' },
  { id: 3, categoria: 'Neumáticos', nombre: 'Desgaste y Presión Delantera', estado: 'sin_evaluar' },
  { id: 4, categoria: 'Neumáticos', nombre: 'Desgaste y Presión Trasera', estado: 'sin_evaluar' },
  { id: 5, categoria: 'Fluidos', nombre: 'Nivel y Estado de Aceite Motor', estado: 'sin_evaluar' },
  { id: 6, categoria: 'Transmisión', nombre: 'Tensión y Lubricación de Cadena', estado: 'sin_evaluar' },
  { id: 7, categoria: 'Suspensión', nombre: 'Retenes y Barras Delanteras', estado: 'sin_evaluar' },
];

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Resumen Superior de Inspección */}
      <View style={styles.headerCard}>
        <View style={styles.topRow}>
          <Text style={styles.headerLabel}>INSPECCIÓN DIGITAL EN BAHÍA</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{evaluados}/{items.length} evaluados</Text>
          </View>
        </View>

        <Text style={styles.ordenTitle}>{ordenSeleccionada}</Text>

        <View style={styles.semaforoSummary}>
          <View style={[styles.summaryPill, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
            <Text style={styles.textVerde}>🟢 {totalVerde} Óptimo</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: '#fefce8', borderColor: '#fef08a' }]}>
            <Text style={styles.textAmarillo}>🟡 {totalAmarillo} Atención</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
            <Text style={styles.textRojo}>🔴 {totalRojo} Urgente</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>CHECKLIST DE REVISIÓN TÉCNICA</Text>

      {items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemCat}>{item.categoria.toUpperCase()}</Text>
            <Text style={styles.itemName}>{item.nombre}</Text>
          </View>

          {/* Botones de semáforo interactivo */}
          <View style={styles.semaforoRow}>
            <TouchableOpacity
              style={[styles.btnSemaforo, item.estado === 'verde' && styles.btnVerdeActive]}
              onPress={() => cambiarEstado(item.id, 'verde')}
              activeOpacity={0.7}
            >
              <Text style={[styles.semaforoText, item.estado === 'verde' && styles.textBold]}>
                🟢 BUENO
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSemaforo, item.estado === 'amarillo' && styles.btnAmarilloActive]}
              onPress={() => cambiarEstado(item.id, 'amarillo')}
              activeOpacity={0.7}
            >
              <Text style={[styles.semaforoText, item.estado === 'amarillo' && styles.textBold]}>
                🟡 ATENCIÓN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnSemaforo, item.estado === 'rojo' && styles.btnRojoActive]}
              onPress={() => cambiarEstado(item.id, 'rojo')}
              activeOpacity={0.7}
            >
              <Text style={[styles.semaforoText, item.estado === 'rojo' && styles.textBold]}>
                🔴 CRÍTICO
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón de Captura de Foto con Cámara */}
          <TouchableOpacity style={styles.fotoBtn} activeOpacity={0.7}>
            <Text style={styles.fotoIcon}>📸</Text>
            <Text style={styles.fotoText}>Adjuntar Foto de Evidencia</Text>
          </TouchableOpacity>
        </View>
      ))}

      {guardadoExito && (
        <View style={styles.exitoPill}>
          <Text style={styles.exitoText}>✅ ¡Inspección guardada y lista para PDF/WhatsApp!</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.btnGuardarDvi}
        onPress={handleGuardar}
        activeOpacity={0.8}
      >
        <Text style={styles.btnGuardarText}>Finalizar y Compartir Diagnóstico</Text>
      </TouchableOpacity>
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
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  progressBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  ordenTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 6,
  },
  semaforoSummary: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  summaryPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  textVerde: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 11,
  },
  textAmarillo: {
    color: '#ca8a04',
    fontWeight: '800',
    fontSize: 11,
  },
  textRojo: {
    color: '#dc2626',
    fontWeight: '800',
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    marginBottom: 10,
  },
  itemCat: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  semaforoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  btnSemaforo: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  btnVerdeActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  btnAmarilloActive: {
    backgroundColor: '#fef9c3',
    borderColor: '#eab308',
  },
  btnRojoActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  semaforoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  textBold: {
    fontWeight: '900',
    color: '#0f172a',
  },
  fotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    gap: 6,
  },
  fotoIcon: {
    fontSize: 14,
  },
  fotoText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  exitoPill: {
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  exitoText: {
    color: '#15803d',
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnGuardarDvi: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnGuardarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
