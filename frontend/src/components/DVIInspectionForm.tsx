import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Camera,
  PenTool,
  Download,
  Loader2,
  Shield,
} from 'lucide-react';
import {
  getDVIByOrden,
  createOrInitDVI,
  updateItem,
  saveFirma,
} from '../api/endpoints/dvi';
import { getOrden } from '../api/endpoints/ordenes';
import DigitalSignaturePad from './DigitalSignaturePad';
import DetalleOrdenPDF from './DetalleOrdenPDF';
import { useToast } from '../context/ToastContext';
import type { InspeccionDVI, ItemDVI, EstadoDVI, OrdenReparacionDetail } from '../types';

interface DVIInspectionFormProps {
  ordenId: number;
}

export default function DVIInspectionForm({ ordenId }: DVIInspectionFormProps) {
  const toast = useToast();
  const [dvi, setDvi] = useState<InspeccionDVI | null>(null);
  const [orden, setOrden] = useState<OrdenReparacionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);

  // Modales
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  // Cargar orden y su inspección DVI
  const cargarDatos = async () => {
    try {
      setLoading(true);
      // 1. Obtener detalles de la orden
      const ordenRes = await getOrden(ordenId);
      setOrden(ordenRes.data);

      // 2. Obtener o inicializar DVI
      try {
        const dviRes = await getDVIByOrden(ordenId);
        setDvi(dviRes.data);
      } catch (err) {
        // Si no existe, crear inicializado con plantilla
        const initRes = await createOrInitDVI({
          orden_id: ordenId,
          tecnico_responsable: 'Técnico Especialista',
          usar_plantilla_esencial: true,
        });
        setDvi(initRes.data);
      }
    } catch (err: any) {
      console.error('Error cargando DVI:', err);
      toast.error('Error cargando datos del DVI', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ordenId) {
      cargarDatos();
    }
  }, [ordenId]);

  // Manejo de cambio de estado de un ítem (Verde, Amarillo, Rojo)
  const handleEstadoChange = async (item: ItemDVI, nuevoEstado: EstadoDVI) => {
    setSavingItemId(item.id);
    try {
      const res = await updateItem(item.id, { estado: nuevoEstado });
      setDvi((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((i) => (i.id === item.id ? { ...i, estado: res.data.estado } : i)),
        };
      });
      toast.info(`Ítem actualizado: ${item.nombre_item}`, `Estado: ${nuevoEstado}`);
    } catch (err: any) {
      toast.error('Error al actualizar ítem', err.message);
    } finally {
      setSavingItemId(null);
    }
  };

  // Guardar observación del ítem al desenfocar el input
  const handleObservacionBlur = async (item: ItemDVI, observaciones: string) => {
    if (item.observaciones === observaciones) return;
    setSavingItemId(item.id);
    try {
      const res = await updateItem(item.id, { observaciones });
      setDvi((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((i) => (i.id === item.id ? { ...i, observaciones: res.data.observaciones } : i)),
        };
      });
    } catch (err: any) {
      toast.error('Error al guardar observaciones', err.message);
    } finally {
      setSavingItemId(null);
    }
  };

  // Guardar firma digital del cliente
  const handleSaveSignature = async (payload: {
    firmaBase64: string;
    nombreFirmante: string;
    documentoFirmante?: string;
  }) => {
    setIsSavingSignature(true);
    try {
      const res = await saveFirma(ordenId, {
        firma_base64: payload.firmaBase64,
        nombre_firmante: payload.nombreFirmante,
        documento_firmante: payload.documentoFirmante,
        aprobado: true,
      });

      setDvi(res.data);
      setShowSignaturePad(false);
      toast.success('¡Firma Registrada!', 'La inspección ha sido autorizada por el cliente.');
      setShowPdfModal(true); // Abrir directamente el PDF consolidado
    } catch (err: any) {
      toast.error('Error al registrar firma', err.message);
    } finally {
      setIsSavingSignature(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold">Cargando Hoja de Inspección DVI...</p>
      </div>
    );
  }

  // Agrupar ítems por categoría (Frenos, Neumáticos, Fluidos, Suspensión, etc.)
  const categorias = dvi?.items.reduce((acc, item) => {
    acc[item.categoria] = acc[item.categoria] || [];
    acc[item.categoria].push(item);
    return acc;
  }, {} as Record<string, ItemDVI[]>) || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Cabecera del DVI */}
      <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Inspección Digital (DVI) — OR #{ordenId}</span>
                {orden?.vehiculo && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-mono font-bold border border-amber-200">
                    {orden.vehiculo.placa}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {orden?.vehiculo.marca} {orden?.vehiculo.modelo} ({orden?.vehiculo.anio}) • Propietario: {orden?.vehiculo.cliente.nombre}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones principales de cabecera */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowSignaturePad(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-card transition-colors cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>{dvi?.firma_cliente ? 'Actualizar Firma' : 'Firmar Aprobación'}</span>
          </button>

          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-card transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generar PDF</span>
          </button>
        </div>
      </div>

      {/* Formulario de Firma (si se activa) */}
      {showSignaturePad && (
        <DigitalSignaturePad
          clienteNombreDefault={orden?.vehiculo.cliente.nombre || ''}
          onSaveSignature={handleSaveSignature}
          onCancel={() => setShowSignaturePad(false)}
          isSaving={isSavingSignature}
        />
      )}

      {/* Resumen de Estado de Aprobación */}
      {dvi?.firma_cliente && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Inspección Firmada y Aprobada por: {dvi.nombre_firmante || 'Cliente'}
              </p>
              <p className="text-xs text-emerald-700">
                Aprobado el {new Date(dvi.fecha_firma || '').toLocaleString('es-MX')}
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-600 text-white">
            APROBADO
          </span>
        </div>
      )}

      {/* Categorías y Checklist de Puntos */}
      <div className="space-y-4">
        {Object.entries(categorias).map(([cat, items]) => {
          return (
            <div
              key={cat}
              className="card overflow-hidden"
            >
              {/* Header de Categoría */}
              <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  {cat} ({items.length} puntos)
                </h3>
              </div>

              {/* Lista de Ítems */}
              <div className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isSaving = savingItemId === item.id;
                  const isVerde = item.estado === 'Verde';
                  const isAmarillo = item.estado === 'Amarillo';
                  const isRojo = item.estado === 'Rojo';

                  return (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Nombre e info del ítem */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.nombre_item}
                        </p>

                        {/* Input de Observaciones técnicas */}
                        <div className="mt-2">
                          <input
                            type="text"
                            defaultValue={item.observaciones || ''}
                            onBlur={(e) => handleObservacionBlur(item, e.target.value)}
                            placeholder="Observaciones / Hallazgo (opcional)..."
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                          />
                        </div>

                        {/* Evidencias fotográficas adjuntas al ítem */}
                        {item.evidencias && item.evidencias.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {item.evidencias.map((ev) => (
                              <span
                                key={ev.id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                <Camera className="w-3 h-3 text-indigo-500" />
                                {ev.descripcion || 'Foto de evidencia'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selector de Semáforo Rápido Táctil */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Verde: OK */}
                        <button
                          type="button"
                          onClick={() => handleEstadoChange(item, 'Verde')}
                          disabled={isSaving}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isVerde
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : 'bg-emerald-50/60 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>OK</span>
                        </button>

                        {/* Amarillo: Atención */}
                        <button
                          type="button"
                          onClick={() => handleEstadoChange(item, 'Amarillo')}
                          disabled={isSaving}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isAmarillo
                              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                              : 'bg-amber-50/60 text-amber-700 border-amber-200 hover:bg-amber-100/60'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Atención</span>
                        </button>

                        {/* Rojo: Urgente */}
                        <button
                          type="button"
                          onClick={() => handleEstadoChange(item, 'Rojo')}
                          disabled={isSaving}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isRojo
                              ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                              : 'bg-rose-50/60 text-rose-700 border-rose-200 hover:bg-rose-100/60'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Urgente</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Visor de PDF */}
      <DetalleOrdenPDF
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        ordenId={ordenId}
        placa={orden?.vehiculo.placa}
        clienteNombre={orden?.vehiculo.cliente.nombre}
        clienteTelefono={orden?.vehiculo.cliente.telefono || ''}
      />
    </div>
  );
}
