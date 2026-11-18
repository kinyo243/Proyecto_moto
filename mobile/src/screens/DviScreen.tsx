import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
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
  const [ordenSeleccionada, setOrdenSeleccionada] = useState('OR-1 • Yamaha MT-03 (AA1B22)');

  const cambiarEstado = (id: number, nuevoEstado: 'verde' | 'amarillo' | 'rojo') => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, estado: nuevoEstado } : it))
    );
  };

  const totalVerde = items.filter((i) => i.estado === 'verde').length;
  const totalAmarillo = items.filter((i) => i.estado === 'amarillo').length;
  const totalRojo = items.filter((i) => i.estado === 'rojo').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Selector de orden activa */}
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>INSPECCIÓN TÉCNICA DVI (MÓVIL)</Text>
        <Text style={styles.ordenTitle}>{ordenSeleccionada}</Text>

        <View style={styles.semaforoSummary}>
          <View style={[styles.summaryPill, { backgroundColor: '#ecfdf5' }]}>
            <Text style={{ color: '#059669', fontWeight: 'bold', fontSize: 12 }}>
              🟢 {totalVerde} OK
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: '#fefce8' }]}>
            <Text style={{ color: '#ca8a04', fontWeight: 'bold', fontSize: 12 }}>
              🟡 {totalAmarillo} Atención
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: '#fef2f2' }]}>
            <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 12 }}>
              🔴 {totalRojo} Urgente
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>PUNTOS DE REVISIÓN EN BAHÍA</Text>

      {items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemCat}>{item.categoria.toUpperCase()}</Text>
            <Text style={styles.itemName}>{item.nombre}</Text>
          </View>

          {/* Botones de semáforo */}
          <View style={styles.semaforoButtons}>
            <TouchableOpacity
              style={[styles.btnTraffic, item.estado === 'verde' && styles.btnVerdeActive]}
              onPress={() => cambiarEstado(item.id, 'verde')}
            >
              <Text style={styles.trafficText}>🟢 BUENO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnTraffic, item.estado === 'amarillo' && styles.btnAmarilloActive]}
              onPress={() => cambiarEstado(item.id, 'amarillo')}
            >
              <Text style={styles.trafficText}>🟡 REGULAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnTraffic, item.estado === 'rojo' && styles.btnRojoActive]}
              onPress={() => cambiarEstado(item.id, 'rojo')}
            >
              <Text style={styles.trafficText}>🔴 CRÍTICO</Text>
            </TouchableOpacity>
          </View>

          {/* Botón de foto técnica */}
          <TouchableOpacity style={styles.fotoBtn}>
            <Text style={styles.fotoIcon}>📷</Text>
            <Text style={styles.fotoText}>Tomar Foto de Evidencia</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.guardarDviBtn}>
        <Text style={styles.guardarDviText}>Finalizar y Notificar al Cliente (WhatsApp / PDF)</Text>
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
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  ordenTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginVertical: 4,
  },
  semaforoSummary: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  summaryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
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
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemCat: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
  },
  itemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  semaforoButtons: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  btnTraffic: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
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
  trafficText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
  },
  fotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    gap: 6,
  },
  fotoIcon: {
    fontSize: 14,
  },
  fotoText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  guardarDviBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  guardarDviText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
