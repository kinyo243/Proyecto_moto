import type { EstadoOrden } from '../../types';

export const STATUS_STYLES: Record<EstadoOrden, { chip: string; dot: string }> = {
  'En Espera': { chip: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
  'En Diagnóstico': { chip: 'bg-sky-50 text-sky-800 ring-sky-200', dot: 'bg-sky-500' },
  'En Reparación': { chip: 'bg-brand-50 text-brand-800 ring-brand-200', dot: 'bg-brand-500' },
  Listo: { chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500' },
  Entregado: { chip: 'bg-slate-50 text-slate-500 ring-slate-200', dot: 'bg-slate-300' },
};

interface BadgeProps {
  status: EstadoOrden;
  label?: string;
}

export default function Badge({ status, label }: BadgeProps) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${s.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label ?? status}
    </span>
  );
}
