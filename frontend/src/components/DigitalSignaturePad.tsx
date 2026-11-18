import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check, X, PenTool, ShieldCheck, User, CreditCard } from 'lucide-react';

interface DigitalSignaturePadProps {
  clienteNombreDefault?: string;
  onSaveSignature: (payload: {
    firmaBase64: string;
    nombreFirmante: string;
    documentoFirmante?: string;
  }) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export default function DigitalSignaturePad({
  clienteNombreDefault = '',
  onSaveSignature,
  onCancel,
  isSaving = false,
}: DigitalSignaturePadProps) {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const [nombreFirmante, setNombreFirmante] = useState(clienteNombreDefault);
  const [documentoFirmante, setDocumentoFirmante] = useState('');
  const [isEmpty, setIsEmpty] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClear = () => {
    sigCanvasRef.current?.clear();
    setIsEmpty(true);
    setErrorMsg(null);
  };

  const handleBeginStroke = () => {
    setIsEmpty(false);
    setErrorMsg(null);
  };

  const handleSave = () => {
    if (!nombreFirmante.trim()) {
      setErrorMsg('Por favor ingresa el nombre de la persona que autoriza.');
      return;
    }

    if (sigCanvasRef.current?.isEmpty() || isEmpty) {
      setErrorMsg('Por favor ingresa la firma en el panel antes de confirmar.');
      return;
    }

    // Obtener dataURL PNG en alta resolución (fondo transparente o blanco)
    const canvas = sigCanvasRef.current?.getCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');

    onSaveSignature({
      firmaBase64: dataUrl,
      nombreFirmante: nombreFirmante.trim(),
      documentoFirmante: documentoFirmante.trim() || undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Header */}
      <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <PenTool className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Firma y Autorización del Cliente
            </h3>
            <p className="text-xs text-slate-500">
              Captura digital en pantalla táctil o con mouse para validez de DVI y presupuesto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Firma Digital Segura</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Datos del firmante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre de Quien Aprueba *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={nombreFirmante}
                onChange={(e) => setNombreFirmante(e.target.value)}
                placeholder="Nombre completo"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Identificación / Documento (Opcional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={documentoFirmante}
                onChange={(e) => setDocumentoFirmante(e.target.value)}
                placeholder="C.I. / DNI / Pasaporte"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>
        </div>

        {/* Canvas de Firma Táctil */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Trazo de Firma en Pantalla *
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Limpiar trazo</span>
            </button>
          </div>

          <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 overflow-hidden touch-none hover:border-indigo-400 transition-colors">
            <SignatureCanvas
              ref={sigCanvasRef}
              onBegin={handleBeginStroke}
              penColor="#0f172a"
              velocityFilterWeight={0.7}
              canvasProps={{
                className: 'w-full h-48 sm:h-56 cursor-crosshair block',
              }}
            />

            {/* Guía visual de firma */}
            <div className="pointer-events-none absolute bottom-8 inset-x-8 border-b border-slate-300/80 flex items-center justify-between pb-1 text-[11px] text-slate-400 select-none">
              <span>✕ Firma aquí</span>
              <span>Aceptación de diagnóstico y presupuesto</span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1">
              ⚠️ {errorMsg}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Guardando Firma...' : 'Registrar Firma Digital'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

