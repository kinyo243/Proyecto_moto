/**
 * TallerMoto Pro — tokens de diseño para la app móvil.
 * Fuente: DESIGN_SYSTEM.md (raíz del repo). No usar hex sueltos en pantallas.
 */
import { Platform, TextStyle, ViewStyle } from 'react-native';
import type { OrdenMovil } from './types';

export const brand = {
  50: '#fff5ed',
  100: '#ffe8d4',
  200: '#ffcda8',
  300: '#ffa970',
  400: '#ff7a37',
  500: '#fd5a12',
  600: '#ee4008',
  700: '#c52e09',
  800: '#9c2610',
  900: '#7e2310',
} as const;

export const colors = {
  brand,
  primary: brand[600],
  primaryPressed: brand[700],
  primarySoft: brand[50],

  // Grafito
  ink950: '#0b0d12',
  ink900: '#12151c',
  ink800: '#1c212b',
  ink700: '#2a303c',

  // Slate
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',

  canvas: '#f6f7f9',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  white: '#ffffff',

  // Semánticos
  success: '#059669',
  successSoft: '#ecfdf5',
  successBorder: '#a7f3d0',
  successText: '#065f46',
  warning: '#d97706',
  warningSoft: '#fffbeb',
  warningBorder: '#fde68a',
  warningText: '#92400e',
  danger: '#e11d48',
  dangerSoft: '#fff1f2',
  dangerBorder: '#fecdd3',
  dangerText: '#9f1239',
  info: '#0284c7',
  infoSoft: '#e0f2fe',
  infoBorder: '#bae6fd',
  infoText: '#075985',

  // Monedas
  usd: '#059669',
  ves: '#0284c7',
  eur: '#7c3aed',
  eurSoft: '#f5f3ff',
  // Variantes claras para usar sobre fondos grafito
  usdOnDark: '#34d399',
  vesOnDark: '#38bdf8',
  eurOnDark: '#a78bfa',
} as const;

/** Colores de chip por estado de orden (DESIGN_SYSTEM.md › Estados de orden). */
export const orderState = {
  espera: { color: '#64748b', bg: '#f1f5f9', text: '#334155', label: 'En Espera' },
  diagnostico: { color: '#0284c7', bg: '#e0f2fe', text: '#075985', label: 'En Diagnóstico' },
  reparacion: { color: '#ee4008', bg: '#fff5ed', text: '#9c2610', label: 'En Reparación' },
  listo: { color: '#059669', bg: '#ecfdf5', text: '#065f46', label: 'Listo' },
  entregado: { color: '#94a3b8', bg: '#f8fafc', text: '#64748b', label: 'Entregado' },
} as const;

export interface OrderStateTone {
  color: string;
  bg: string;
  text: string;
  label: string;
}

/** Traduce el estado técnico de la orden a su tono visual y etiqueta legible. */
export function orderStateStyle(estado: OrdenMovil['estado']): OrderStateTone {
  switch (estado) {
    case 'recepcion':
      return { ...orderState.espera, label: 'Recepción' };
    case 'en_espera_repuestos':
      return { ...orderState.espera, label: 'Esperando repuestos' };
    case 'dvi_pendiente':
      return { ...orderState.diagnostico, label: 'DVI pendiente' };
    case 'control_calidad':
      return { ...orderState.diagnostico, label: 'Control de calidad' };
    case 'en_trabajo':
      return orderState.reparacion;
    case 'listo':
      return orderState.listo;
    case 'entregado':
      return orderState.entregado;
    default:
      return orderState.espera;
  }
}

export const radius = {
  control: 8,
  sm: 12,
  card: 16,
  sheet: 24,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  gutter: 16,
} as const;

/** Tamaño mínimo de área táctil. */
export const touch = { min: 44 } as const;

/** Sombra suave (tarjetas). */
export const shadowSoft: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.08)' },
  android: { elevation: 2, shadowColor: '#0f172a' },
  default: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
});

/** Sombra elevada (barras, botones primarios, hojas). */
export const shadowRaised: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 10px 30px -12px rgba(15,23,42,.25)' },
  android: { elevation: 8, shadowColor: '#0f172a' },
  default: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
});

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const type = {
  pageTitle: { fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.3 } as TextStyle,
  section: { fontSize: 15, fontWeight: '600', color: colors.text } as TextStyle,
  body: { fontSize: 14, fontWeight: '400', color: colors.text } as TextStyle,
  bodyStrong: { fontSize: 14, fontWeight: '600', color: colors.text } as TextStyle,
  caption: { fontSize: 12, fontWeight: '400', color: colors.textSecondary } as TextStyle,
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  } as TextStyle,
  kpiXL: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: -1, ...tabular } as TextStyle,
  kpi: { fontSize: 18, fontWeight: '700', color: colors.text, ...tabular } as TextStyle,
  amount: { fontSize: 14, fontWeight: '700', color: colors.text, ...tabular } as TextStyle,
  tabular,
} as const;

/** Tarjeta estándar: superficie blanca, radio 16, borde slate-200, sombra suave. */
export const card: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.card,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.lg,
  ...shadowSoft,
};

/** Botón primario de marca. */
export const primaryButton: ViewStyle = {
  backgroundColor: colors.primary,
  minHeight: 50,
  paddingHorizontal: spacing.xl,
  borderRadius: radius.sm,
  alignItems: 'center',
  justifyContent: 'center',
  ...shadowRaised,
};

export const primaryButtonText: TextStyle = {
  color: colors.white,
  fontSize: 15,
  fontWeight: '600',
};

export const theme = { colors, brand, orderState, radius, spacing, touch, type, card, shadowSoft, shadowRaised };
export default theme;
