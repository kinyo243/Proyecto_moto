import { useState, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  FileCheck,
  DollarSign,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { getOrdenes, updateOrdenEstado } from '../api/endpoints/ordenes';
import { useToast } from '../context/ToastContext';
import type { OrdenReparacion, EstadoOrden } from '../types';

const ESTADOS_KANBAN: { estado: EstadoOrden; label: string; color: string; badgeBg: string; dot: string }[] = [
  { estado: 'En Espera', label: 'En Espera', color: 'border-t-slate-400', badgeBg: 'text-slate-700', dot: 'bg-slate-400' },
  { estado: 'En Diagnóstico', label: 'En Diagnóstico', color: 'border-t-sky-500', badgeBg: 'text-sky-800', dot: 'bg-sky-500' },
  { estado: 'En Reparación', label: 'En Reparación', color: 'border-t-brand-500', badgeBg: 'text-brand-800', dot: 'bg-brand-500' },
  { estado: 'Listo', label: 'Listo para Entrega', color: 'border-t-emerald-500', badgeBg: 'text-emerald-800', dot: 'bg-emerald-500' },
  { estado: 'Entregado', label: 'Entregado', color: 'border-t-slate-300', badgeBg: 'text-slate-500', dot: 'bg-slate-300' },
];

const PROXIMO_ESTADO: Record<EstadoOrden, EstadoOrden | null> = {
  'En Espera': 'En Diagnóstico',
  'En Diagnóstico': 'En Reparación',
  'En Reparación': 'Listo',
  'Listo': 'Entregado',
  'Entregado': null,
};

interface KanbanBoardProps {
  onSelectOrden: (ordenId: number, tab?: 'dvi' | 'presupuesto') => void;
}

export default function KanbanBoard({ onSelectOrden }: KanbanBoardProps) {
  const toast = useToast();
  const [ordenes, setOrdenes] = useState<OrdenReparacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filtro, setFiltro] = useState('');

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const res = await getOrdenes({ limit: 100 });
      setOrdenes(res.data);
    } catch (err: any) {
      toast.error('Error al cargar tablero', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const handleAvanzarEstado = async (orden: OrdenReparacion) => {
    const next = PROXIMO_ESTADO[orden.estado];
    if (!next) return;

    setUpdatingId(orden.id);
    try {
      await updateOrdenEstado(orden.id, next);
      setOrdenes((prev) =>
        prev.map((o) => (o.id === orden.id ? { ...o, estado: next } : o))
      );
      toast.success(
        'Estado Actualizado',
        `Orden #${orden.id} pasó a "${next}".`
      );
    } catch (err: any) {
      toast.error('Error al actualizar estado', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const ordenesFiltradas = ordenes.filter(
    (o) =>
      o.id.toString().includes(filtro) ||
      (o.notas_recepcion && o.notas_recepcion.toLowerCase().includes(filtro.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="card flex flex-col items-center justify-center p-16 text-slate-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold">Cargando tablero operativo Kanban...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra superior de herramientas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por # orden o notas de recepción..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white shadow-card"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={cargarOrdenes}
          className="btn-ghost shadow-card w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualizar Tablero</span>
        </button>
      </div>

      {/* Grid de Columnas Kanban */}
      <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-4 items-start overflow-x-auto pb-4 -mx-1 px-1">
        {ESTADOS_KANBAN.map(({ estado, label, color, badgeBg, dot }) => {
          const colOrdenes = ordenesFiltradas.filter((o) => o.estado === estado);

          return (
            <div
              key={estado}
              className={`rounded-2xl border border-slate-200/80 border-t-[3px] bg-slate-100/60 p-3 min-w-[250px] flex flex-col gap-3 ${color}`}
            >
              {/* Header de la columna */}
              <div className="flex items-center justify-between px-1">
                <span className={`flex items-center gap-2 text-xs font-semibold ${badgeBg}`}>
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {label}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  {colOrdenes.length}
                </span>
              </div>

              {/* Tarjetas de órdenes en esta columna */}
              <div className="space-y-2.5 min-h-[300px]">
                {colOrdenes.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
                    Sin órdenes en esta fase
                  </div>
                ) : (
                  colOrdenes.map((orden) => {
                    const nextEstado = PROXIMO_ESTADO[orden.estado];
                    const isUpdating = updatingId === orden.id;

                    return (
                      <div
                        key={orden.id}
                        className="group bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between animate-fade-in"
                      >
                        {/* Cabecera de la tarjeta */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            OR #{orden.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(orden.fecha_creacion).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        </div>

                        {/* Contenido / Observaciones */}
                        <div>
                          <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                            {orden.notas_recepcion || 'Ingreso general'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Vehículo ID: #{orden.vehiculo_id}
                          </p>
                        </div>

                        {/* Accesos directos rápidos a DVI y Presupuesto */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => onSelectOrden(orden.id, 'dvi')}
                            className="flex items-center justify-center gap-1 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-[10px] font-bold text-slate-700 hover:text-indigo-600 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <FileCheck className="w-3 h-3 text-indigo-500" />
                            <span>DVI</span>
                          </button>

                          <button
                            onClick={() => onSelectOrden(orden.id, 'presupuesto')}
                            className="flex items-center justify-center gap-1 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-[10px] font-bold text-slate-700 hover:text-emerald-600 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <DollarSign className="w-3 h-3 text-emerald-500" />
                            <span>Cotizar</span>
                          </button>
                        </div>

                        {/* Botón de avanzar fase */}
                        {nextEstado && (
                          <button
                            onClick={() => handleAvanzarEstado(orden)}
                            disabled={isUpdating}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <span>Avanzar a {nextEstado}</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
