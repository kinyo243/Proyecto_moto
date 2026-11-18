import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { TasasBCV } from '../types';

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
    <View style={styles.container}>
      {/* Badge Oficial */}
      <View style={styles.badgeBCV}>
        <Text style={styles.badgeDot}>●</Text>
        <Text style={styles.badgeText}>BCV</Text>
      </View>

      {/* Chips de Tasas */}
      <View style={styles.ratesWrapper}>
        {/* Dólar */}
        <View style={styles.rateChipUsd}>
          <Text style={styles.currencySymbolUsd}>$</Text>
          <Text style={styles.rateValue}>
            {loading && !tasas ? '...' : formatBs(tasas?.usd)}
          </Text>
        </View>

        {/* Euro */}
        <View style={styles.rateChipEur}>
          <Text style={styles.currencySymbolEur}>€</Text>
          <Text style={styles.rateValue}>
            {loading && !tasas ? '...' : formatBs(tasas?.eur)}
          </Text>
        </View>
      </View>

      {/* Botón Refresco */}
      <TouchableOpacity
        onPress={onRefresh}
        style={styles.refreshBtn}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={[styles.refreshIcon, loading && styles.spinning]}>
          {loading ? '⏳' : '🔄'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeBCV: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f172a',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  badgeDot: {
    color: '#10b981',
    fontSize: 8,
  },
  badgeText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ratesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateChipUsd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  currencySymbolUsd: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '900',
  },
  rateChipEur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  currencySymbolEur: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '900',
  },
  rateValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  refreshBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  refreshIcon: {
    fontSize: 13,
  },
  spinning: {
    opacity: 0.5,
  },
});
