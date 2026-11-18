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
      <View style={styles.badgeBCV}>
        <Text style={styles.badgeText}>BCV OFICIAL</Text>
      </View>

      <View style={styles.rateGroup}>
        <View style={styles.rateItem}>
          <Text style={styles.currencyLabelUsd}>$ USD</Text>
          <Text style={styles.rateValueUsd}>
            {loading && !tasas ? '...' : `Bs. ${formatBs(tasas?.usd)}`}
          </Text>
        </View>

        <Text style={styles.separator}>|</Text>

        <View style={styles.rateItem}>
          <Text style={styles.currencyLabelEur}>€ EUR</Text>
          <Text style={styles.rateValueEur}>
            {loading && !tasas ? '...' : `Bs. ${formatBs(tasas?.eur)}`}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
        <Text style={styles.refreshText}>{loading ? '⏳' : '🔄'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeBCV: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencyLabelUsd: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  rateValueUsd: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  separator: {
    color: '#475569',
    fontSize: 12,
  },
  currencyLabelEur: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
  },
  rateValueEur: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  refreshButton: {
    padding: 4,
  },
  refreshText: {
    fontSize: 14,
  },
});
