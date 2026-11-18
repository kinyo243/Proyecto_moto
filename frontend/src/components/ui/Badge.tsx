import type { EstadoOrden } from '../../types';

const statusStyles: Record<EstadoOrden, string> = {
  'En Espera':
    'bg-slate-100 text-slate-700 border border-slate-300',
  'En Diagnóstico':
    'bg-yellow-100 text-yellow-800 border border-yellow-300',
  'En Reparación':
    'bg-blue-100 text-blue-800 border border-blue-300',
  'Listo':
    'bg-green-100 text-green-800 border border-green-300',
  'Entregado':
    'bg-gray-100 text-gray-500 border border-gray-200',
};

interface BadgeProps {
  status: EstadoOrden;
  label?: string;
}

export default function Badge({ status, label }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {label ?? status}
    </span>
  );
}

