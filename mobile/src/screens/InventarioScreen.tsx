import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import type { RepuestoInventario, TasasBCV } from '../types';

interface InventarioScreenProps {
  tasas: TasasBCV | null;
}

const CATEGORIAS = ['Todos', 'Frenos', 'Fluidos', 'Transmisión', 'Motor'];

const MOCK_REPUESTOS: RepuestoInventario[] = [
  {
    id: 1,
    codigo_parte: 'PAS-MOT-01',
    descripcion: 'Pastillas de Freno Delanteras Cerámicas (GN125 / TX)',
    categoria: 'Frenos',
    stock_actual: 8,
    stock_minimo: 3,
    ubicacion_pasillo: 'Pasillo 1',
    ubicacion_estante: 'Estante B',
    ubicacion_gaveta: 'Gaveta 14',
    costo_usd: 6.50,
    precio_venta_usd: 12.00,
  },
  {
    id: 2,
    codigo_parte: 'ACE-20W50-4T',
    descripcion: 'Aceite Mineral 20W-50 4T 1L Motul 3000',
    categoria: 'Fluidos',
    stock_actual: 2,
    stock_minimo: 6,
    ubicacion_pasillo: 'Pasillo Principal',
    ubicacion_estante: 'Estante A (Exhibidor)',
    costo_usd: 5.20,
    precio_venta_usd: 9.50,
  },
  {
    id: 3,
    codigo_parte: 'KIT-TRA-428',
    descripcion: 'Kit de Arrastre Cadena Reforzada + Piñón/Corona 428H',
    categoria: 'Transmisión',
    stock_actual: 4,
    stock_minimo: 2,
    ubicacion_pasillo: 'Pasillo 2',
    ubicacion_estante: 'Estante D',
    ubicacion_gaveta: 'Piso 2',
    costo_usd: 18.00,
    precio_venta_usd: 32.00,
  },
  {
    id: 4,
    codigo_parte: 'BUJ-NGK-CR7',
    descripcion: 'Bujía Estándar NGK CR7HSA',
    categoria: 'Motor',
    stock_actual: 15,
    stock_minimo: 5,
    ubicacion_pasillo: 'Mostrador',
    ubicacion_estante: 'Gavetero Frontal',
    ubicacion_gaveta: 'Caja 3',
    costo_usd: 2.10,
    precio_venta_usd: 4.50,
  },
];

export const InventarioScreen: React.FC<InventarioScreenProps> = ({ tasas }) => {
  const [busqueda, setBusqueda] = useState('');
  const [catActiva, setCatActiva] = useState('Todos');
  const tasaBcv = tasas?.usd || 916.65;

  const repuestosFiltrados = MOCK_REPUESTOS.filter((r) => {
    const matchCat = catActiva === 'Todos' || r.categoria.toLowerCase() === catActiva.toLowerCase();
    const matchTexto =
      r.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.codigo_parte.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.ubicacion_pasillo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchTexto;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Buscador de repuestos */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar repuesto, código o pasillo..."
          placeholderTextColor="#94a3b8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros de Categoría */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, catActiva === cat && styles.catChipActive]}
            onPress={() => setCatActiva(cat)}
            activeOpacity={0.7}
          >
            <Text style={[styles.catChipText, catActiva === cat && styles.catChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>CATÁLOGO CON UBICACIÓN EN TALLER</Text>
        <Text style={styles.resultsCount}>{repuestosFiltrados.length} piezas</Text>
      </View>

      {repuestosFiltrados.map((rep) => {
        const esBajoStock = rep.stock_actual <= rep.stock_minimo;
        const precioBs = rep.precio_venta_usd * tasaBcv;
        const margen = (((rep.precio_venta_usd - rep.costo_usd) / rep.costo_usd) * 100).toFixed(0);

        return (
          <View key={rep.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{rep.codigo_parte}</Text>
              </View>
              <View style={[styles.stockBadge, esBajoStock ? styles.stockBajo : styles.stockOk]}>
                <Text style={[styles.stockText, esBajoStock ? styles.stockTextBajo : styles.stockTextOk]}>
                  {esBajoStock ? '⚠️ STOCK MÍNIMO' : 'DISPONIBLE'}: {rep.stock_actual} uds
                </Text>
              </View>
            </View>

            <Text style={styles.nombre}>{rep.descripcion}</Text>

            {/* Ubicación física exacta en el taller */}
            <View style={styles.locationContainer}>
              <Text style={styles.locationPin}>📍</Text>
              <View style={styles.locationTextGroup}>
                <Text style={styles.locationLabel}>Ubicación:</Text>
                <Text style={styles.locationValue}>
                  {rep.ubicacion_pasillo} • {rep.ubicacion_estante} {rep.ubicacion_gaveta ? `• ${rep.ubicacion_gaveta}` : ''}
                </Text>
              </View>
            </View>

            {/* Precios Multimoneda */}
            <View style={styles.footerPrices}>
              <View>
                <Text style={styles.priceSub}>Precio al Público</Text>
                <Text style={styles.priceUsd}>${rep.precio_venta_usd.toFixed(2)} USD</Text>
                <Text style={styles.priceBs}>
                  ≈ Bs. {precioBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.costoBox}>
                <Text style={styles.costoLabel}>Costo: ${rep.costo_usd.toFixed(2)}</Text>
                <View style={styles.margenPill}>
                  <Text style={styles.margenText}>+{margen}% Margen</Text>
                </View>
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
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 95,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  clearBtn: {
    color: '#94a3b8',
    fontSize: 16,
    padding: 4,
  },
  catScroll: {
    marginBottom: 14,
  },
  catChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  catChipText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  resultsCount: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockOk: {
    backgroundColor: '#ecfdf5',
  },
  stockBajo: {
    backgroundColor: '#fef2f2',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stockTextOk: {
    color: '#059669',
  },
  stockTextBajo: {
    color: '#dc2626',
  },
  nombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginVertical: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  locationPin: {
    fontSize: 14,
    marginRight: 6,
  },
  locationTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  locationValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
  },
  footerPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  priceSub: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  priceUsd: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  priceBs: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  costoBox: {
    alignItems: 'flex-end',
  },
  costoLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 2,
  },
  margenPill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  margenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
});
