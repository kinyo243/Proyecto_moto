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

const ESTADOS_KANBAN: { estado: EstadoOrden; label: string; color: string; badgeBg: string }[] = [
  { estado: 'En Espera', label: '1. En Espera', color: 'border-slate-300', badgeBg: 'bg-slate-100 text-slate-800' },
  { estado: 'En Diagnóstico', label: '2. En Diagnóstico', color: 'border-amber-400', badgeBg: 'bg-amber-100 text-amber-900' },
  { estado: 'En Reparación', label: '3. En Reparación', color: 'border-indigo-400', badgeBg: 'bg-indigo-100 text-indigo-900' },
  { estado: 'Listo', label: '4. Listo para Entrega', color: 'border-emerald-400', badgeBg: 'bg-emerald-100 text-emerald-900' },
  { estado: 'Entregado', label: '5. Entregado / Cerrado', color: 'border-slate-200', badgeBg: 'bg-slate-50 text-slate-500' },
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
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 text-slate-400 gap-2">
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
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <button
          onClick={cargarOrdenes}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs cursor-pointer transition-colors w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualizar Tablero</span>
        </button>
      </div>

      {/* Grid de Columnas Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {ESTADOS_KANBAN.map(({ estado, label, color, badgeBg }) => {
          const colOrdenes = ordenesFiltradas.filter((o) => o.estado === estado);

          return (
            <div
              key={estado}
              className={`rounded-2xl border bg-slate-50/70 p-3 min-w-[240px] flex flex-col gap-3 shadow-xs ${color}`}
            >
              {/* Header de la columna */}
              <div className="flex items-center justify-between px-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${badgeBg}`}>
                  {label}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  {colOrdenes.length}
                </span>
              </div>

              {/* Tarjetas de órdenes en esta columna */}
              <div className="space-y-2.5 min-h-[300px]">
                {colOrdenes.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-[11px] text-slate-400">
                    Sin órdenes en esta fase
                  </div>
                ) : (
                  colOrdenes.map((orden) => {
                    const nextEstado = PROXIMO_ESTADO[orden.estado];
                    const isUpdating = updatingId === orden.id;

                    return (
                      <div
                        key={orden.id}
                        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-all space-y-2.5 flex flex-col justify-between"
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
