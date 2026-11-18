import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconColor?: string;
  trend?: { value: number; positive: boolean };
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  iconColor = 'text-indigo-500',
  trend,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-start gap-4">
      <div className={`rounded-lg bg-gray-50 p-3 ${iconColor}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {trend && (
          <p
            className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-500'}`}
          >
            {trend.positive ? '▲' : '▼'} {Math.abs(trend.value)} vs ayer
          </p>
        )}
      </div>
    </div>
  );
}

