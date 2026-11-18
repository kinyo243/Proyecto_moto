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

  const montoNumUsd = parseFloat(montoCobrarUsd) || 0;
  const equivalenteBs = montoNumUsd * tasaBcv;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Encabezado Fina: Cuadre de Caja Diario */}
      <View style={styles.cajaHeaderCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.headerTitle}>CUADRE DE CAJA DEL DÍA</Text>
          <Text style={styles.headerDate}>Hoy • {new Date().toLocaleDateString('es-VE')}</Text>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Facturado y Cobrado</Text>
          <Text style={styles.totalUsd}>${caja.total_ingresos_usd.toFixed(2)} USD</Text>
          <Text style={styles.totalBs}>
            Equivalente BCV: Bs. {(caja.total_ingresos_usd * tasaBcv).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Desglose por Método de Pago (Estilo Fina) */}
        <Text style={styles.subTitle}>DESGLOSE POR FORMA DE COBRO</Text>
        
        <View style={styles.desgloseList}>
          <View style={styles.desgloseItem}>
            <View style={styles.metodoLeft}>
              <Text style={styles.metodoIcon}>💵</Text>
              <Text style={styles.metodoName}>Efectivo Dólares ($)</Text>
            </View>
            <Text style={styles.metodoMonto}>${caja.desglose.efectivo_usd.toFixed(2)}</Text>
          </View>

          <View style={styles.desgloseItem}>
            <View style={styles.metodoLeft}>
              <Text style={styles.metodoIcon}>📲</Text>
              <Text style={styles.metodoName}>Pago Móvil (Bs.)</Text>
            </View>
            <View style={styles.alignRight}>
              <Text style={styles.metodoMonto}>Bs. {caja.desglose.pago_movil_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.metodoMontoSub}>≈ ${(caja.desglose.pago_movil_ves / tasaBcv).toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.desgloseItem}>
            <View style={styles.metodoLeft}>
              <Text style={styles.metodoIcon}>💳</Text>
              <Text style={styles.metodoName}>Punto de Venta / Débito</Text>
            </View>
            <View style={styles.alignRight}>
              <Text style={styles.metodoMonto}>Bs. {caja.desglose.punto_debito_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.metodoMontoSub}>≈ ${(caja.desglose.punto_debito_ves / tasaBcv).toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.desgloseItem}>
            <View style={styles.metodoLeft}>
              <Text style={styles.metodoIcon}>⚡</Text>
              <Text style={styles.metodoName}>Zelle ($)</Text>
            </View>
            <Text style={styles.metodoMonto}>${caja.desglose.zelle_usd.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Módulo de Cobro Rápido POS */}
      <View style={styles.posCard}>
        <Text style={styles.headerTitle}>REGISTRAR COBRO RÁPIDO (POS)</Text>
        <Text style={styles.posDesc}>Convierte automáticamente a tasa oficial BCV ({tasaBcv.toFixed(2)} Bs/$).</Text>

        <Text style={styles.inputLabel}>Monto a Cobrar ($ USD):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={montoCobrarUsd}
          onChangeText={setMontoCobrarUsd}
        />

        <View style={styles.conversionAlert}>
          <Text style={styles.conversionLabel}>Total a cobrar en Bolívares (BCV):</Text>
          <Text style={styles.conversionValue}>
            Bs. {equivalenteBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <Text style={styles.inputLabel}>Forma de Pago del Cliente:</Text>
        <View style={styles.metodosGrid}>
          <TouchableOpacity
            style={[styles.metodoBtn, metodoSeleccionado === 'pago_movil' && styles.metodoBtnActive]}
            onPress={() => setMetodoSeleccionado('pago_movil')}
          >
            <Text style={styles.btnIcon}>📲</Text>
            <Text style={[styles.btnText, metodoSeleccionado === 'pago_movil' && styles.btnTextActive]}>Pago Móvil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metodoBtn, metodoSeleccionado === 'efectivo_usd' && styles.metodoBtnActive]}
            onPress={() => setMetodoSeleccionado('efectivo_usd')}
          >
            <Text style={styles.btnIcon}>💵</Text>
            <Text style={[styles.btnText, metodoSeleccionado === 'efectivo_usd' && styles.btnTextActive]}>Efectivo $</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metodoBtn, metodoSeleccionado === 'punto' && styles.metodoBtnActive]}
            onPress={() => setMetodoSeleccionado('punto')}
          >
            <Text style={styles.btnIcon}>💳</Text>
            <Text style={[styles.btnText, metodoSeleccionado === 'punto' && styles.btnTextActive]}>Punto Tarjeta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metodoBtn, metodoSeleccionado === 'zelle' && styles.metodoBtnActive]}
            onPress={() => setMetodoSeleccionado('zelle')}
          >
            <Text style={styles.btnIcon}>⚡</Text>
            <Text style={[styles.btnText, metodoSeleccionado === 'zelle' && styles.btnTextActive]}>Zelle</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitCobroBtn}>
          <Text style={styles.submitCobroText}>Confirmar y Emitir Recibo Digital</Text>
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
    paddingBottom: 40,
  },
  cajaHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  headerDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  totalBox: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  totalUsd: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  totalBs: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  desgloseList: {
    gap: 8,
  },
  desgloseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metodoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metodoIcon: {
    fontSize: 16,
  },
  metodoName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  metodoMonto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  metodoMontoSub: {
    fontSize: 10,
    color: '#64748b',
  },
  posCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  posDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  conversionAlert: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  conversionLabel: {
    fontSize: 11,
    color: '#047857',
  },
  conversionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
    marginTop: 2,
  },
  metodosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metodoBtn: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  metodoBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  btnIcon: {
    fontSize: 16,
  },
  btnText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  btnTextActive: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  submitCobroBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitCobroText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
