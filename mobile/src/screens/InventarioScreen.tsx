import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import type { RepuestoInventario, TasasBCV } from '../types';
import { card, colors, radius, spacing, touch, type } from '../theme';

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Buscador de repuestos */}
      <View style={styles.searchBox}>
        <View style={styles.searchIcon}>
          <View style={styles.searchIconRing} />
          <View style={styles.searchIconHandle} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar repuesto, código o pasillo..."
          placeholderTextColor={colors.slate400}
          selectionColor={colors.primary}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity
            onPress={() => setBusqueda('')}
            style={styles.clearBtn}
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros de Categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catScrollContent}
      >
        {CATEGORIAS.map((cat) => {
          const active = catActiva === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, active && styles.catChipActive]}
              onPress={() => setCatActiva(cat)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Catálogo con ubicación</Text>
        <View style={styles.countBadge}>
          <Text style={styles.resultsCount}>{repuestosFiltrados.length} piezas</Text>
        </View>
      </View>

      {repuestosFiltrados.map((rep) => {
        const esBajoStock = rep.stock_actual <= rep.stock_minimo;
        const precioBs = rep.precio_venta_usd * tasaBcv;
        const margen = (((rep.precio_venta_usd - rep.costo_usd) / rep.costo_usd) * 100).toFixed(0);

        return (
          <View key={rep.id} style={[card, styles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{rep.codigo_parte}</Text>
              </View>
              <View style={[styles.stockBadge, esBajoStock ? styles.stockBajo : styles.stockOk]}>
                <View style={[styles.stockDot, { backgroundColor: esBajoStock ? colors.danger : colors.success }]} />
                <Text style={[styles.stockText, esBajoStock ? styles.stockTextBajo : styles.stockTextOk]}>
                  {esBajoStock ? 'Stock mínimo' : 'Disponible'}: {rep.stock_actual} uds
                </Text>
              </View>
            </View>

            <Text style={styles.nombre}>{rep.descripcion}</Text>

            {/* Ubicación física exacta en el taller */}
            <View style={styles.locationContainer}>
              <View style={styles.locationPin} />
              <View style={styles.locationTextGroup}>
                <Text style={styles.locationLabel}>Ubicación</Text>
                <Text style={styles.locationValue}>
                  {rep.ubicacion_pasillo} • {rep.ubicacion_estante} {rep.ubicacion_gaveta ? `• ${rep.ubicacion_gaveta}` : ''}
                </Text>
              </View>
            </View>

            {/* Precios Multimoneda */}
            <View style={styles.footerPrices}>
              <View>
                <Text style={styles.priceSub}>Precio al público</Text>
                <Text style={styles.priceUsd}>
                  ${rep.precio_venta_usd.toFixed(2)} <Text style={styles.priceUsdCurrency}>USD</Text>
                </Text>
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
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.gutter,
    paddingBottom: spacing.xxxl,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    minHeight: 48,
    marginBottom: spacing.md,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: spacing.sm,
  },
  searchIconRing: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.slate400,
  },
  searchIconHandle: {
    position: 'absolute',
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.slate400,
    right: 0,
    bottom: 3,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  clearBtn: {
    width: touch.min,
    height: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: colors.slate400,
    fontSize: 16,
  },
  catScroll: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.gutter,
  },
  catScrollContent: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.sm,
  },
  catChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  catChipActive: {
    backgroundColor: colors.ink900,
    borderColor: colors.ink900,
  },
  catChipText: {
    fontSize: 13,
    color: colors.slate600,
    fontWeight: '500',
  },
  catChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...type.label,
  },
  countBadge: {
    backgroundColor: colors.slate100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  resultsCount: {
    fontSize: 11,
    color: colors.slate600,
    fontWeight: '600',
    ...type.tabular,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  codeBadge: {
    backgroundColor: colors.slate100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate600,
    letterSpacing: 0.4,
    ...type.tabular,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockOk: {
    backgroundColor: colors.successSoft,
  },
  stockBajo: {
    backgroundColor: colors.dangerSoft,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
    ...type.tabular,
  },
  stockTextOk: {
    color: colors.successText,
  },
  stockTextBajo: {
    color: colors.dangerText,
  },
  nombre: {
    ...type.section,
    lineHeight: 21,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate50,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.control,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  locationPin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  locationTextGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  locationValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate700,
  },
  footerPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
  },
  priceSub: {
    ...type.label,
    fontSize: 10,
    color: colors.textTertiary,
  },
  priceUsd: {
    ...type.kpi,
    color: colors.usd,
    marginTop: 2,
  },
  priceUsdCurrency: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceBs: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ves,
    ...type.tabular,
  },
  costoBox: {
    alignItems: 'flex-end',
  },
  costoLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    ...type.tabular,
  },
  margenPill: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  margenText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.successText,
    ...type.tabular,
  },
});
