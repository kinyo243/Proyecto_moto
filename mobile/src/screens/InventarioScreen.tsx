import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import type { RepuestoInventario, TasasBCV } from '../types';

interface InventarioScreenProps {
  tasas: TasasBCV | null;
}

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
  const tasaBcv = tasas?.usd || 916.65;

  const repuestosFiltrados = MOCK_REPUESTOS.filter((r) =>
    r.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.codigo_parte.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Buscador de repuestos */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar código, repuesto o pasillo..."
          placeholderTextColor="#94a3b8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <Text style={styles.sectionTitle}>
        CATÁLOGO CON UBICACIÓN EN TALLER ({repuestosFiltrados.length})
      </Text>

      {repuestosFiltrados.map((rep) => {
        const esBajoStock = rep.stock_actual <= rep.stock_minimo;
        const precioBs = rep.precio_venta_usd * tasaBcv;

        return (
          <View key={rep.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{rep.codigo_parte}</Text>
              </View>
              <View style={[styles.stockBadge, esBajoStock ? styles.stockBajo : styles.stockOk]}>
                <Text style={[styles.stockText, esBajoStock ? styles.stockTextBajo : styles.stockTextOk]}>
                  {esBajoStock ? '⚠️ STOCK BAJO' : 'DISPONIBLE'}: {rep.stock_actual} uds
                </Text>
              </View>
            </View>

            <Text style={styles.nombre}>{rep.descripcion}</Text>

            {/* Ubicación exacta estilo Fina */}
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationLabel}>Ubicación:</Text>
              <Text style={styles.locationValue}>
                {rep.ubicacion_pasillo} • {rep.ubicacion_estante} {rep.ubicacion_gaveta ? `• ${rep.ubicacion_gaveta}` : ''}
              </Text>
            </View>

            {/* Precios Multimoneda */}
            <View style={styles.footerPrices}>
              <View>
                <Text style={styles.priceSub}>Precio al Público:</Text>
                <Text style={styles.priceUsd}>${rep.precio_venta_usd.toFixed(2)} USD</Text>
                <Text style={styles.priceBs}>
                  ≈ Bs. {precioBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.costoBox}>
                <Text style={styles.costoLabel}>Costo / Margen</Text>
                <Text style={styles.costoVal}>${rep.costo_usd.toFixed(2)}</Text>
                <Text style={styles.margenText}>
                  +{(((rep.precio_venta_usd - rep.costo_usd) / rep.costo_usd) * 100).toFixed(0)}% margen
                </Text>
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
    paddingBottom: 40,
  },
  searchContainer: {
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
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
    fontWeight: 'bold',
    color: '#475569',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockOk: {
    backgroundColor: '#ecfdf5',
  },
  stockBajo: {
    backgroundColor: '#fef2f2',
  },
  stockText: {
    fontSize: 10,
    fontWeight: 'bold',
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
    paddingVertical: 6,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  locationIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 6,
  },
  locationValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  footerPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    marginTop: 4,
  },
  priceSub: {
    fontSize: 10,
    color: '#64748b',
  },
  priceUsd: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  priceBs: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  costoBox: {
    alignItems: 'flex-end',
  },
  costoLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  costoVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  margenText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
});
