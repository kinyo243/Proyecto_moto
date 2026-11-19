import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import type { TasasBCV } from '../types';
import { colors, radius, spacing, touch, type } from '../theme';

interface HeaderBCVProps {
  tasas: TasasBCV | null;
  loading: boolean;
  onRefresh: () => void;
}

export const HeaderBCV: React.FC<HeaderBCVProps> = ({ tasas, loading, onRefresh }) => {
  const formatBs = (val?: number) => {
    if (!val) return '...';
    return val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <View style={styles.band}>
      <View style={styles.container}>
        {/* Badge Oficial */}
        <View style={styles.badgeBCV}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>BCV</Text>
        </View>

        {/* Chips de Tasas */}
        <View style={styles.ratesWrapper}>
          {/* Dólar */}
          <View style={styles.rateChip}>
            <Text style={[styles.currencySymbol, { color: colors.usdOnDark }]}>USD</Text>
            <Text style={styles.rateValue}>
              {loading && !tasas ? '...' : formatBs(tasas?.usd)}
            </Text>
          </View>

          {/* Euro */}
          <View style={styles.rateChip}>
            <Text style={[styles.currencySymbol, { color: colors.eurOnDark }]}>EUR</Text>
            <Text style={styles.rateValue}>
              {loading && !tasas ? '...' : formatBs(tasas?.eur)}
            </Text>
          </View>
        </View>

        {/* Botón Refresco */}
        <TouchableOpacity
          onPress={onRefresh}
          style={[styles.refreshBtn, loading && styles.spinning]}
          disabled={loading}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Actualizar tasas BCV"
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.slate400} />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.ink950,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.ink700,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: spacing.sm,
  },
  badgeBCV: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.control,
    backgroundColor: colors.ink900,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  badgeText: {
    ...type.label,
    color: colors.slate200,
    fontSize: 10,
    fontWeight: '700',
  },
  ratesWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  rateChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currencySymbol: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  rateValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    ...type.tabular,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink700,
    minWidth: touch.min - 8,
  },
  refreshIcon: {
    color: colors.slate200,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  spinning: {
    opacity: 0.6,
  },
});
