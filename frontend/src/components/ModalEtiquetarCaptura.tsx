import React, { useState } from 'react';
import { X, Check, Tag, AlertTriangle, Image as ImageIcon, Loader2 } from 'lucide-react';

const ETIQUETAS_RAPIDAS = [
  'Daño en disco de freno',
  'Fuga de aceite / líquido',
  'Desgaste excesivo de neumático',
  'Cadena floja / desgastada',
  'Golpe / rayón en chasis',
  'Inspección de suspensión',
  'Pastillas de freno gastadas',
  'Filtro de aire sucio',
];

interface ModalEtiquetarCapturaProps {
  isOpen: boolean;
  onClose: () => void;
  captureData: {
    blob: Blob;
    dataUrl: string;
    bahiaId: number;
    camaraId?: number;
    ordenId?: number;
    bahiaNombre: string;
  } | null;
  onGuardar: (payload: {
    blob: Blob;
    notas: string;
    bahiaId: number;
    camaraId?: number;
    ordenId: number;
  }) => Promise<void>;
}

export default function ModalEtiquetarCaptura({
  isOpen,
  onClose,
  captureData,
  onGuardar,
}: ModalEtiquetarCapturaProps) {
  if (!isOpen || !captureData) return null;

  const [notaPersonalizada, setNotaPersonalizada] = useState('');
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);
  const [ordenIdManual, setOrdenIdManual] = useState<string>(
    captureData.ordenId ? captureData.ordenId.toString() : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleEtiqueta = (etiqueta: string) => {
    setEtiquetasSeleccionadas((prev) =>
      prev.includes(etiqueta) ? prev.filter((e) => e !== etiqueta) : [...prev, etiqueta]
    );
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetOrdenId = parseInt(ordenIdManual, 10);
    if (isNaN(targetOrdenId) || targetOrdenId <= 0) {
      setErrorMsg('Debe seleccionar o indicar una Orden de Reparación activa.');
      return;
    }

    const notasPartes: string[] = [];
    if (etiquetasSeleccionadas.length > 0) {
      notasPartes.push(etiquetasSeleccionadas.join('; '));
    }
    if (notaPersonalizada.trim()) {
      notasPartes.push(notaPersonalizada.trim());
    }

    const notasFinales = notasPartes.join(' - ') || 'Captura de inspección desde cámara de bahía';

    setIsSubmitting(true);
    try {
      await onGuardar({
        blob: captureData.blob,
        notas: notasFinales,
        bahiaId: captureData.bahiaId,
        camaraId: captureData.camaraId,
        ordenId: targetOrdenId,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la captura.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Evidencia de Inspección: {captureData.bahiaNombre}
              </h3>
              <p className="text-xs text-slate-500">
                Fotograma congelado en alta resolución
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Form */}
        <form onSubmit={handleGuardar} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Vista previa de la captura */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video max-h-48 flex items-center justify-center">
            <img
              src={captureData.dataUrl}
              alt="Fotograma capturado"
              className="w-full h-full object-contain"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Vinculación de Orden */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Vincular a Orden de Reparación *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                value={ordenIdManual}
                onChange={(e) => setOrdenIdManual(e.target.value)}
                placeholder="Número de OR (ej. 1)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {!captureData.ordenId && (
              <p className="text-[11px] text-amber-600 mt-1">
                Esta bahía no tenía orden asignada automáticamente. Indica el ID de la orden activa.
              </p>
            )}
          </div>

          {/* Etiquetas Rápidas Táctiles */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Etiquetas Rápidas de Diagnóstico
            </label>
            <div className="flex flex-wrap gap-2">
              {ETIQUETAS_RAPIDAS.map((tag) => {
                const isSelected = etiquetasSeleccionadas.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleEtiqueta(tag)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-card'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas / Observaciones adicionales */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción u Observaciones Adicionales
            </label>
            <textarea
              rows={2}
              value={notaPersonalizada}
              onChange={(e) => setNotaPersonalizada(e.target.value)}
              placeholder="Ej. Fuga visible en retén de horquilla delantera izquierda..."
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Footer del Modal */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm shadow-brand-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Subiendo Evidencia...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Adjuntar a la Orden</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

