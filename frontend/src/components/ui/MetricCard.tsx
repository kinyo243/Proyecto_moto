import type { LucideIcon } from 'lucide-react';

type Tone = 'brand' | 'sky' | 'amber' | 'emerald' | 'slate';

const TONES: Record<Tone, { tile: string; bar: string }> = {
  brand: { tile: 'bg-brand-50 text-brand-600 ring-brand-100', bar: 'from-brand-500 to-brand-300' },
  sky: { tile: 'bg-sky-50 text-sky-600 ring-sky-100', bar: 'from-sky-500 to-sky-300' },
  amber: { tile: 'bg-amber-50 text-amber-600 ring-amber-100', bar: 'from-amber-500 to-amber-300' },
  emerald: { tile: 'bg-emerald-50 text-emerald-600 ring-emerald-100', bar: 'from-emerald-500 to-emerald-300' },
  slate: { tile: 'bg-slate-100 text-slate-600 ring-slate-200', bar: 'from-slate-500 to-slate-300' },
};

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: Tone;
  hint?: string;
  /** @deprecated usar `tone` */
  iconColor?: string;
  trend?: { value: number; positive: boolean };
}

export default function MetricCard({ icon: Icon, label, value, tone = 'brand', hint, trend }: MetricCardProps) {
  const t = TONES[tone];
  return (
    <div className="card group relative overflow-hidden p-5 transition-shadow hover:shadow-elevated">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${t.bar} opacity-80`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow truncate">{label}</p>
          <p className="num mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.positive ? '▲' : '▼'} {Math.abs(trend.value)} vs ayer
            </p>
          )}
        </div>
        <div className={`rounded-xl p-2.5 ring-1 ring-inset ${t.tile}`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}
