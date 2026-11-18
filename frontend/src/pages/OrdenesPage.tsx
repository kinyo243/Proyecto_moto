import { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  FileCheck,
  Download,
  ArrowLeft,
  Loader2,
  RefreshCw,
  DollarSign,
  Kanban,
  Table as TableIcon,
} from 'lucide-react';
import { getOrdenes } from '../api/endpoints/ordenes';
import DVIInspectionForm from '../components/DVIInspectionForm';
import PresupuestoEditor from '../components/PresupuestoEditor';
import DetalleOrdenPDF from '../components/DetalleOrdenPDF';
import KanbanBoard from '../components/KanbanBoard';
import Badge from '../components/ui/Badge';
import type { OrdenReparacion } from '../types';

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<OrdenReparacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vistaModo, setVistaModo] = useState<'kanban' | 'tabla'>('kanban');
  const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dvi' | 'presupuesto'>('dvi');

  // Modal PDF directo
  const [pdfModalOrdenId, setPdfModalOrdenId] = useState<number | null>(null);

  const fetchOrdenes = async () => {
    setLoading(true);
    try {
      const res = await getOrdenes({ limit: 50 });
      setOrdenes(res.data);
    } catch (err) {
      console.error('Error fetching ordenes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  // Si hay una orden seleccionada, mostramos las pestañas de DVI o Presupuesto
  if (ordenSeleccionadaId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => setOrdenSeleccionadaId(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Listado de Órdenes</span>
          </button>

          {/* Selector de pestañas */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
            <button
              onClick={() => setActiveTab('dvi')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dvi'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Inspección DVI</span>
            </button>
            <button
              onClick={() => setActiveTab('presupuesto')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'presupuesto'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Presupuesto y Pagos</span>
            </button>
          </div>
        </div>

        {activeTab === 'dvi' ? (
          <DVIInspectionForm ordenId={ordenSeleccionadaId} />
        ) : (
          <PresupuestoEditor ordenId={ordenSeleccionadaId} />
        )}
      </div>
    );
  }

  const ordenesFiltradas = ordenes.filter(
    (o) =>
      o.id.toString().includes(search) ||
      (o.notas_recepcion && o.notas_recepcion.toLowerCase().includes(search.toLowerCase())) ||
      o.estado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wrench className="w-6 h-6" />
            </span>
            Gestión de Órdenes y DVI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisión técnica, inspección de puntos (DVI), firma de clientes y reportes PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Selector de Vista: Kanban vs Tabla */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setVistaModo('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                vistaModo === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Tablero Kanban</span>
            </button>
            <button
              onClick={() => setVistaModo('tabla')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                vistaModo === 'tabla'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>

          <button
            onClick={fetchOrdenes}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar por número de orden, notas o estado..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-xs"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
      </div>

      {/* Contenido según el modo de vista */}
      {vistaModo === 'kanban' ? (
        <KanbanBoard
          onSelectOrden={(id, tab) => {
            setOrdenSeleccionadaId(id);
            if (tab) setActiveTab(tab);
          }}
        />
      ) : (
        /* Tabla de Órdenes */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs font-semibold">Cargando órdenes del taller...</p>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <p className="text-center py-16 text-sm text-slate-400">
            No se encontraron órdenes de reparación.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-4">Orden</th>
                  <th className="px-5 py-4">Vehículo</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Fecha de Ingreso</th>
                  <th className="px-5 py-4">Notas de Recepción</th>
                  <th className="px-5 py-4 text-right">Acciones DVI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordenesFiltradas.map((orden) => (
                  <tr key={orden.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      #{orden.id}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">
                      ID Vehículo #{orden.vehiculo_id}
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={orden.estado} />
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(orden.fecha_creacion).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {orden.notas_recepcion || 'Sin observaciones'}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setOrdenSeleccionadaId(orden.id);
                          setActiveTab('dvi');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Abrir checklist de inspección digital"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>DVI</span>
                      </button>

                      <button
                        onClick={() => {
                          setOrdenSeleccionadaId(orden.id);
                          setActiveTab('presupuesto');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Gestionar presupuesto y repuestos"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Presupuesto</span>
                      </button>

                      <button
                        onClick={() => setPdfModalOrdenId(orden.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Ver o descargar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Modal de PDF si se clickea desde la tabla */}
      {pdfModalOrdenId && (
        <DetalleOrdenPDF
          isOpen={true}
          onClose={() => setPdfModalOrdenId(null)}
          ordenId={pdfModalOrdenId}
        />
      )}
    </div>
  );
}
