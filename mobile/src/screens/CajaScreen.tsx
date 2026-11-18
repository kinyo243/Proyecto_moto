import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import type { TasasBCV, ResumenCajaHoy } from '../types';

interface CajaScreenProps {
  tasas: TasasBCV | null;
  caja: ResumenCajaHoy;
}

export const CajaScreen: React.FC<CajaScreenProps> = ({ tasas, caja }) => {
  const tasaBcv = tasas?.usd || 916.65;
  const [montoCobrarUsd, setMontoCobrarUsd] = useState('45.00');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<'efectivo_usd' | 'pago_movil' | 'punto' | 'zelle'>('pago_movil');
  const [cobradoExito, setCobradoExito] = useState(false);

  const montoNumUsd = parseFloat(montoCobrarUsd) || 0;
  const equivalenteBs = montoNumUsd * tasaBcv;

  const handleCobro = () => {
    setCobradoExito(true);
    setTimeout(() => setCobradoExito(false), 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tarjeta de Saldo y Cuadre Diario */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>CUADRE DE CAJA DIARIO</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>VIGENTE</Text>
          </View>
        </View>

        <View style={styles.totalDisplay}>
          <Text style={styles.totalLabel}>Total Facturado en Caja</Text>
          <Text style={styles.totalMontoUsd}>${caja.total_ingresos_usd.toFixed(2)} USD</Text>
          <View style={styles.bcvConversionPill}>
            <Text style={styles.bcvConversionText}>
              Equivalente BCV: Bs. {(caja.total_ingresos_usd * tasaBcv).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Desglose por método de cobro */}
        <Text style={styles.sectionSubtitle}>DESGLOSE POR FORMA DE COBRO</Text>

        <View style={styles.metodosList}>
          <View style={styles.metodoRow}>
            <View style={styles.metodoLeft}>
              <View style={[styles.metodoIconBox, { backgroundColor: '#ecfdf5' }]}>
                <Text style={styles.metodoIcon}>💵</Text>
              </View>
              <View>
                <Text style={styles.metodoTitle}>Efectivo Dólares ($)</Text>
                <Text style={styles.metodoSub}>Caja física taller</Text>
              </View>
            </View>
            <Text style={styles.metodoMonto}>${caja.desglose.efectivo_usd.toFixed(2)}</Text>
          </View>

          <View style={styles.metodoRow}>
            <View style={styles.metodoLeft}>
              <View style={[styles.metodoIconBox, { backgroundColor: '#eff6ff' }]}>
                <Text style={styles.metodoIcon}>📲</Text>
              </View>
              <View>
                <Text style={styles.metodoTitle}>Pago Móvil (Bs.)</Text>
                <Text style={styles.metodoSub}>Tasa oficial BCV</Text>
              </View>
            </View>
            <View style={styles.alignRight}>
              <Text style={styles.metodoMonto}>Bs. {caja.desglose.pago_movil_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.metodoSub}>≈ ${(caja.desglose.pago_movil_ves / tasaBcv).toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.metodoRow}>
            <View style={styles.metodoLeft}>
              <View style={[styles.metodoIconBox, { backgroundColor: '#faf5ff' }]}>
                <Text style={styles.metodoIcon}>💳</Text>
              </View>
              <View>
                <Text style={styles.metodoTitle}>Punto de Venta / Débito</Text>
                <Text style={styles.metodoSub}>Lote bancario nacional</Text>
              </View>
            </View>
            <View style={styles.alignRight}>
              <Text style={styles.metodoMonto}>Bs. {caja.desglose.punto_debito_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.metodoSub}>≈ ${(caja.desglose.punto_debito_ves / tasaBcv).toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.metodoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.metodoLeft}>
              <View style={[styles.metodoIconBox, { backgroundColor: '#fefce8' }]}>
                <Text style={styles.metodoIcon}>⚡</Text>
              </View>
              <View>
                <Text style={styles.metodoTitle}>Zelle ($)</Text>
                <Text style={styles.metodoSub}>Depósito internacional</Text>
              </View>
            </View>
            <Text style={styles.metodoMonto}>${caja.desglose.zelle_usd.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Módulo de Cobro Rápido POS */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>REGISTRAR COBRO RÁPIDO (POS)</Text>
        <Text style={styles.posDesc}>
          Cálculo al instante a tasa oficial BCV: <Text style={{ fontWeight: 'bold' }}>{tasaBcv.toFixed(2)} Bs/$</Text>
        </Text>

        <Text style={styles.fieldLabel}>Monto a Cobrar ($ USD):</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputPrefix}>$</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={montoCobrarUsd}
            onChangeText={setMontoCobrarUsd}
            placeholder="0.00"
          />
        </View>

        {/* Cuadro de Conversión en Bolívares */}
        <View style={styles.conversionCard}>
          <Text style={styles.conversionLabel}>Total a cancelar en Bolívares (VES):</Text>
          <Text style={styles.conversionMonto}>
            Bs. {equivalenteBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <Text style={styles.fieldLabel}>Método de Pago:</Text>
        <View style={styles.metodosGrid}>
          <TouchableOpacity
            style={[styles.metodoGridBtn, metodoSeleccionado === 'pago_movil' && styles.metodoGridBtnActive]}
            onPress={() => setMetodoSeleccionado('pago_movil')}
            activeOpacity={0.7}
          >
            <Text style={styles.gridEmoji}>📲</Text>
            <Text style={[styles.gridText, metodoSeleccionado === 'pago_movil' && styles.gridTextActive]}>
              Pago Móvil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metodoGridBtn, metodoSeleccionado === 'efectivo_usd' && styles.metodoGridBtnActive]}
            onPress={() => setMetodoSeleccionado('efectivo_usd')}
            activeOpacity={0.7}
          >
            <Text style={styles.gridEmoji}>💵</Text>
            <Text style={[styles.gridText, metodoSeleccionado === 'efectivo_usd' && styles.gridTextActive]}>
              Efectivo $
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metodoGridBtn, metodoSeleccionado === 'punto' && styles.metodoGridBtnActive]}
            onPress={() => setMetodoSeleccionado('punto')}
            activeOpacity={0.7}
          >
            <Text style={styles.gridEmoji}>💳</Text>
            <Text style={[styles.gridText, metodoSeleccionado === 'punto' && styles.gridTextActive]}>
              Punto Débito
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metodoGridBtn, metodoSeleccionado === 'zelle' && styles.metodoGridBtnActive]}
            onPress={() => setMetodoSeleccionado('zelle')}
            activeOpacity={0.7}
          >
            <Text style={styles.gridEmoji}>⚡</Text>
            <Text style={[styles.gridText, metodoSeleccionado === 'zelle' && styles.gridTextActive]}>
              Zelle
            </Text>
          </TouchableOpacity>
        </View>

        {cobradoExito && (
          <View style={styles.exitoPill}>
            <Text style={styles.exitoText}>✅ ¡Cobro registrado con éxito en caja!</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.btnConfirmar}
          onPress={handleCobro}
          activeOpacity={0.8}
        >
          <Text style={styles.btnConfirmarText}>Confirmar y Emitir Recibo</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  statusPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563eb',
  },
  totalDisplay: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  totalMontoUsd: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  bcvConversionPill: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  bcvConversionText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  metodosList: {
    backgroundColor: '#ffffff',
  },
  metodoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metodoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metodoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metodoIcon: {
    fontSize: 18,
  },
  metodoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  metodoSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  metodoMonto: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  posDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    paddingVertical: 10,
  },
  conversionCard: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  conversionLabel: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '600',
  },
  conversionMonto: {
    fontSize: 19,
    fontWeight: '900',
    color: '#065f46',
    marginTop: 2,
  },
  metodosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metodoGridBtn: {
    width: '48.5%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  metodoGridBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  gridEmoji: {
    fontSize: 18,
  },
  gridText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  gridTextActive: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  exitoPill: {
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  exitoText: {
    color: '#15803d',
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnConfirmar: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnConfirmarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
