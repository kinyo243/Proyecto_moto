import { ClipboardList, Wrench, Search, RefreshCw } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useLanguage } from '../context/LanguageContext';
import MetricCard from '../components/ui/MetricCard';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { EstadoOrden, OrdenReparacion } from '../types';
import type { TranslationKey } from '../i18n/es';

// Active estados for display in table
const TABLE_STATES: EstadoOrden[] = [
  'En Espera',
  'En Diagnóstico',
  'En Reparación',
  'Listo',
];

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { ordenes, bahias, loading, error, activeCount, pendingInspections, refresh } =
    useDashboard();

  const activeOrders = ordenes.filter((o) => TABLE_STATES.includes(o.estado));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {t('nav.dashboard')}
        </h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {t('dash.refresh')}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('dash.error')} — {error}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={ClipboardList}
          label={t('dash.active_orders')}
          value={loading ? '—' : activeCount}
          iconColor="text-indigo-500"
        />
        <MetricCard
          icon={Wrench}
          label={t('dash.vehicles_in_bays')}
          value={loading ? '—' : bahias.length}
          iconColor="text-blue-500"
        />
        <MetricCard
          icon={Search}
          label={t('dash.pending_inspections')}
          value={loading ? '—' : pendingInspections}
          iconColor="text-amber-500"
        />
      </div>

      {/* Orders table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700">
            {t('dash.recent_orders')}
          </h2>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : activeOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            {t('dash.no_orders')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {(
                    [
                      'table.id',
                      'table.plate',
                      'table.vehicle',
                      'table.client',
                      'table.status',
                      'table.created',
                    ] as TranslationKey[]
                  ).map((key) => (
                    <th key={key} className="px-4 py-3">
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeOrders.map((orden: OrdenReparacion) => (
                  <tr
                    key={orden.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-gray-500">
                      #{orden.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {/* vehiculo_id placeholder — detail fetched on demand */}
                      OR-{orden.vehiculo_id}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      Vehículo #{orden.vehiculo_id}
                    </td>
                    <td className="px-4 py-3 text-gray-600">—</td>
                    <td className="px-4 py-3">
                      <Badge
                        status={orden.estado}
                        label={t(
                          `status.${orden.estado}` as TranslationKey,
                        )}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(orden.fecha_creacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

