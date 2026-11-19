import { useState, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import BahiaCameraViewer from '../components/BahiaCameraViewer';
import ModalEtiquetarCaptura from '../components/ModalEtiquetarCaptura';
import { getBahias, uploadEvidenciaFormData } from '../api/endpoints/bahias';
import { useToast } from '../context/ToastContext';
import type { BahiaDetail } from '../types';

export default function CamarasPage() {
  const toast = useToast();
  const [bahias, setBahias] = useState<BahiaDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estado del modal de etiquetado
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCapture, setActiveCapture] = useState<{
    blob: Blob;
    dataUrl: string;
    bahiaId: number;
    camaraId?: number;
    ordenId?: number;
    bahiaNombre: string;
  } | null>(null);

  // Cargar lista de bahías del taller con sus cámaras
  const cargarBahias = async () => {
    try {
      const res = await getBahias();
      if (res.data && res.data.length > 0) {
        setBahias(res.data);
      } else {
        // Fallback visual con las 3 bahías típicas de taller para que la interfaz siempre esté lista
        setBahias([
          {
            id: 1,
            nombre_bahia: 'Bahía 1 - Mecánica General',
            descripcion: 'Elevador hidráulico 1',
            camaras: [
              {
                id: 1,
                bahia_id: 1,
                url_rtsp: 'rtsp://localhost:8554/bahia1',
                estado: 'activa',
              },
            ],
            orden_activa: {
              id: 1,
              vehiculo_id: 1,
              estado: 'En Reparación',
              notas_recepcion: 'Revisión general',
              fecha_creacion: new Date().toISOString(),
              fecha_actualizacion: new Date().toISOString(),
            },
          },
          {
            id: 2,
            nombre_bahia: 'Bahía 2 - Frenos y Suspensión',
            descripcion: 'Elevador de motos 2',
            camaras: [
              {
                id: 2,
                bahia_id: 2,
                url_rtsp: 'rtsp://localhost:8554/bahia2',
                estado: 'activa',
              },
            ],
            orden_activa: null,
          },
          {
            id: 3,
            nombre_bahia: 'Elevador Principal - Diagnóstico',
            descripcion: 'Área de scanner e inspección DVI',
            camaras: [
              {
                id: 3,
                bahia_id: 3,
                url_rtsp: 'rtsp://localhost:8554/bahia3',
                estado: 'activa',
              },
            ],
            orden_activa: null,
          },
        ]);
      }
    } catch (err) {
      console.warn('Backend aún sin bahías o sin conexión; cargando mock de taller:', err);
      setBahias([
        {
          id: 1,
          nombre_bahia: 'Bahía 1 - Elevador Principal',
          descripcion: 'Elevador hidráulico 1',
          camaras: [
            {
              id: 1,
              bahia_id: 1,
              url_rtsp: 'rtsp://localhost:8554/bahia1',
              estado: 'activa',
            },
          ],
          orden_activa: null,
        },
        {
          id: 2,
          nombre_bahia: 'Bahía 2 - Servicio Rápido',
          descripcion: 'Mantenimiento preventivo',
          camaras: [
            {
              id: 2,
              bahia_id: 2,
              url_rtsp: 'rtsp://localhost:8554/bahia2',
              estado: 'activa',
            },
          ],
          orden_activa: null,
        },
        {
          id: 3,
          nombre_bahia: 'Bahía 3 - Eléctrico y Diagnóstico',
          descripcion: 'Inspección computarizada',
          camaras: [
            {
              id: 3,
              bahia_id: 3,
              url_rtsp: 'rtsp://localhost:8554/bahia3',
              estado: 'activa',
            },
          ],
          orden_activa: null,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarBahias();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    cargarBahias();
  };

  // Callback al capturar un fotograma desde cualquier visor de bahía
  const handleCaptureFrame = (data: {
    blob: Blob;
    dataUrl: string;
    bahiaId: number;
    camaraId?: number;
    ordenId?: number;
    bahiaNombre: string;
  }) => {
    setActiveCapture(data);
    setModalOpen(true);
  };

  // Guardar evidencia enviando FormData al backend
  const handleGuardarEvidencia = async (payload: {
    blob: Blob;
    notas: string;
    bahiaId: number;
    camaraId?: number;
    ordenId: number;
  }) => {
    // 1. Empaquetar FormData multipart
    const formData = new FormData();
    const fileName = `inspeccion_bahia_${payload.bahiaId}_${Date.now()}.jpg`;
    formData.append('file', payload.blob, fileName);
    formData.append('notas', payload.notas);
    if (payload.camaraId) {
      formData.append('camara_id', payload.camaraId.toString());
    }
    formData.append('orden_id', payload.ordenId.toString());

    // 2. Enviar al endpoint de captura de bahía
    await uploadEvidenciaFormData(payload.bahiaId, formData);

    toast.success(
      'Fotograma Guardado con Éxito',
      `Se adjuntó la evidencia a la Orden #${payload.ordenId}: "${payload.notas}".`
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-brand-50 text-brand-600 rounded-xl ring-1 ring-inset ring-brand-100">
              <Camera className="w-6 h-6" />
            </span>
            Monitoreo en Vivo de Bahías
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Transmisión de cámaras de taller, inspección en tiempo real y captura fotográfica de evidencias.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-card cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar Feeds</span>
          </button>
        </div>
      </div>

      {/* Grid de Bahías y Cámaras */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold">Conectando con streams de cámaras...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bahias.map((bahia) => {
            const camara = bahia.camaras && bahia.camaras.length > 0 ? bahia.camaras[0] : undefined;
            return (
              <div
                key={bahia.id}
                className="card p-4 flex flex-col gap-3"
              >
                {/* Visor de Video HLS / HTML5 de la bahía */}
                <BahiaCameraViewer
                  bahia={bahia}
                  camara={camara}
                  onCaptureFrame={handleCaptureFrame}
                />

                {/* Info inferior de la Bahía */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{bahia.nombre_bahia}</h3>
                    <p className="text-xs text-slate-500">{bahia.descripcion || 'Sin descripción'}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    ID #{bahia.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para etiquetar fotograma */}
      <ModalEtiquetarCaptura
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        captureData={activeCapture}
        onGuardar={handleGuardarEvidencia}
      />
    </div>
  );
}
