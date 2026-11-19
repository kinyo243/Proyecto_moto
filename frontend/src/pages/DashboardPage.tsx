import { ClipboardList, Wrench, Search, RefreshCw, CheckCircle2, Inbox, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/ui/MetricCard';
import Badge, { STATUS_STYLES } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { EstadoOrden, OrdenReparacion } from '../types';
import type { TranslationKey } from '../i18n/es';

const TABLE_STATES: EstadoOrden[] = ['En Espera', 'En Diagnóstico', 'En Reparación', 'Listo'];

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('es-VE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const { usuario } = useAuth();
  const { ordenes, bahias, loading, error, activeCount, pendingInspections, refresh } = useDashboard();

  const activeOrders = ordenes.filter((o) => TABLE_STATES.includes(o.estado));
  const readyCount = ordenes.filter((o) => o.estado === 'Listo').length;
  const firstName = usuario?.nombre_completo?.split(' ')[0];

  const pipeline = TABLE_STATES.map((estado) => ({
    estado,
    count: ordenes.filter((o) => o.estado === estado).length,
  }));
  const pipelineTotal = pipeline.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Panel de control</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
            {greeting()}
            {firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Así va el taller hoy.</p>
        </div>
        <button onClick={refresh} disabled={loading} className="btn-ghost w-fit shadow-card">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {t('dash.refresh')}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-500" />
          <div>
            <p className="font-semibold">{t('dash.error')}</p>
            <p className="text-rose-700/80">{error}</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ClipboardList}
          label={t('dash.active_orders')}
          value={loading ? '—' : activeCount}
          tone="brand"
          hint="En proceso en el taller"
        />
        <MetricCard
          icon={Wrench}
          label={t('dash.vehicles_in_bays')}
          value={loading ? '—' : bahias.length}
          tone="sky"
          hint="Bahías configuradas"
        />
        <MetricCard
          icon={Search}
          label={t('dash.pending_inspections')}
          value={loading ? '—' : pendingInspections}
          tone="amber"
          hint="Espera o diagnóstico"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Listas para entrega"
          value={loading ? '—' : readyCount}
          tone="emerald"
          hint="Avisar al cliente"
        />
      </div>

      {/* Flujo de trabajo */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Flujo de trabajo</h2>
          <span className="num text-xs text-slate-500">{pipelineTotal} órdenes activas</span>
        </div>
        <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          {pipelineTotal > 0 &&
            pipeline.map(({ estado, count }) =>
              count > 0 ? (
                <div
                  key={estado}
                  className={`${STATUS_STYLES[estado].dot} transition-all first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${(count / pipelineTotal) * 100}%` }}
                  title={`${estado}: ${count}`}
                />
              ) : null,
            )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {pipeline.map(({ estado, count }) => (
            <div key={estado} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[estado].dot}`} />
              <span className="flex-1 truncate text-xs font-medium text-slate-600">
                {t(`status.${estado}` as TranslationKey)}
              </span>
              <span className="num text-sm font-bold text-slate-900">{loading ? '—' : count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tabla de órdenes */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{t('dash.recent_orders')}</h2>
            <p className="text-xs text-slate-500">Órdenes activas ordenadas por ingreso</p>
          </div>
          {!loading && activeOrders.length > 0 && (
            <span className="num rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {activeOrders.length}
            </span>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label={t('dash.loading')} />
        ) : activeOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox size={22} />
            </span>
            <p className="text-sm font-medium text-slate-600">{t('dash.no_orders')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  {(
                    ['table.id', 'table.plate', 'table.vehicle', 'table.client', 'table.status', 'table.created'] as TranslationKey[]
                  ).map((key) => (
                    <th key={key} className="px-5 py-3">
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeOrders.map((orden: OrdenReparacion) => (
                  <tr key={orden.id} className="transition-colors hover:bg-brand-50/40">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-500">#{orden.id}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
                        OR-{orden.vehiculo_id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">Vehículo #{orden.vehiculo_id}</td>
                    <td className="px-5 py-3.5 text-slate-400">—</td>
                    <td className="px-5 py-3.5">
                      <Badge status={orden.estado} label={t(`status.${orden.estado}` as TranslationKey)} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">{formatDate(orden.fecha_creacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
