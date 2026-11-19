import { useState } from 'react';
import {
  FileText,
  Download,
  X,
  ExternalLink,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DetalleOrdenPDFProps {
  isOpen: boolean;
  onClose: () => void;
  ordenId: number;
  placa?: string;
  clienteNombre?: string;
  clienteTelefono?: string;
}

export default function DetalleOrdenPDF({
  isOpen,
  onClose,
  ordenId,
  placa = '',
  clienteNombre = '',
  clienteTelefono = '',
}: DetalleOrdenPDFProps) {
  if (!isOpen) return null;

  const toast = useToast();
  const [loadingPdf, setLoadingPdf] = useState(true);

  // URL del PDF en FastAPI
  const pdfUrl = `http://localhost:8000/api/v1/dvi/orden/${ordenId}/pdf`;

  const handleDescargar = async () => {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Error al generar el PDF del reporte.');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Reporte_DVI_OR_${ordenId}_${placa || 'Taller'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Descarga iniciada', 'El archivo PDF se ha descargado correctamente.');
    } catch (err: any) {
      toast.error('Error al descargar PDF', err.message || 'No se pudo generar el documento');
    }
  };

  const handleEnviarWhatsApp = () => {
    const telefonoLimpio = clienteTelefono.replace(/[^0-9]/g, '');
    const mensaje = encodeURIComponent(
      `¡Hola ${clienteNombre || 'estimado cliente'}! 👋 Le compartimos el reporte digital de inspección DVI de su vehículo (${placa || 'en taller'}) con las evidencias fotográficas y estado de diagnóstico. Puede consultarlo en el taller o solicitar copia en PDF.`
    );

    const waUrl = telefonoLimpio
      ? `https://wa.me/${telefonoLimpio}?text=${mensaje}`
      : `https://api.whatsapp.com/send?text=${mensaje}`;

    window.open(waUrl, '_blank');
    toast.info('Abriendo WhatsApp', 'Se preparó el mensaje para enviar al cliente.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Informe Consolidado DVI — OR #{ordenId}</span>
                {placa && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-mono font-bold border border-amber-200">
                    {placa}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Documento técnico con inspección de puntos, fotos de cámaras y firma digital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEnviarWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-card transition-colors cursor-pointer"
              title="Compartir enlace/reporte por WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar WhatsApp</span>
            </button>

            <button
              onClick={handleDescargar}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-card transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visor de PDF (iframe) */}
        <div className="relative flex-1 bg-slate-100 overflow-hidden flex items-center justify-center">
          {loadingPdf && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-xs font-semibold">Compilando reporte con ReportLab...</p>
            </div>
          )}

          <iframe
            src={pdfUrl}
            onLoad={() => setLoadingPdf(false)}
            className="w-full h-full border-none"
            title={`Reporte DVI OR #${ordenId}`}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Documento listo para entrega al cliente.</span>
          </div>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <span>Abrir en pestaña nueva</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
