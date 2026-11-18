import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * Propiedades del componente de streaming y captura de inspección
 */
export interface LiveBayCameraPlayerProps {
  bahiaId: number;
  bahiaNombre: string;
  camaraId: number;
  streamName: string; // ej: "bahia_1_cam_1"
  mediaGatewayHost?: string; // ej: "http://localhost:8889"
  apiBaseUrl?: string; // ej: "http://localhost:8000/api/v1"
  ordenActiva?: {
    id: number;
    estado: string;
    vehiculoPlaca?: string;
    vehiculoModelo?: string;
  } | null;
  onCapturaExitosa?: (evidenciaId: number, archivoPath: string) => void;
}

export const LiveBayCameraPlayer: React.FC<LiveBayCameraPlayerProps> = ({
  bahiaId,
  bahiaNombre,
  camaraId,
  streamName,
  mediaGatewayHost = "http://localhost:8889",
  apiBaseUrl = "http://localhost:8000/api/v1",
  ordenActiva,
  onCapturaExitosa,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Estados de interfaz y streaming
  const [conexionEstado, setConexionEstado] = useState<"conectando" | "en_vivo" | "error" | "desconectado">("conectando");
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [flashEfecto, setFlashEfecto] = useState<boolean>(false);

  // Estados de la captura
  const [capturando, setCapturando] = useState<boolean>(false);
  const [fotoPrevia, setFotoPrevia] = useState<string | null>(null);
  const [notasInspeccion, setNotasInspeccion] = useState<string>("");
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  /**
   * Inicializa la conexión WebRTC WHEP (WebRTC HTTP Egress Protocol) con MediaMTX o go2rtc.
   * Proporciona latencia ultra baja (<500 ms) en navegadores modernos.
   */
  const iniciarStreamWHEP = useCallback(async () => {
    if (!videoRef.current) return;
    setConexionEstado("conectando");
    setErrorMensaje(null);

    // Cerrar conexión anterior si existía
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      });
      pcRef.current = pc;

      // Escuchar el track de video que llega del Media Gateway
      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setConexionEstado("en_vivo");
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setConexionEstado("error");
          setErrorMensaje("Conexión de video interrumpida. Reintentando...");
        }
      };

      // Solicitar únicamente recepción de video (recvonly)
      pc.addTransceiver("video", { direction: "recvonly" });

      // Generar SDP Offer local
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Negociación WHEP estándar mediante POST HTTP al MediaMTX
      const whepUrl = `${mediaGatewayHost}/${streamName}/whep`;
      const response = await fetch(whepUrl, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });

      if (!response.ok) {
        throw new Error(`Media Gateway respondió con código HTTP ${response.status}`);
      }

      // Establecer SDP Answer recibido del Gateway
      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (err: any) {
      console.error("[CameraStream Error]", err);
      setConexionEstado("error");
      setErrorMensaje(err.message || "No se pudo conectar al stream en vivo.");
    }
  }, [mediaGatewayHost, streamName]);

  useEffect(() => {
    iniciarStreamWHEP();
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [iniciarStreamWHEP]);

  /**
   * Captura rápida del fotograma actual del elemento <video> mediante un <canvas> invisible
   */
  const handleTomarFotoInspeccion = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      alert("El video aún no está listo para capturar fotogramas.");
      return;
    }

    // Efecto visual de obturador (flash blanco de cámara fotográfica)
    setFlashEfecto(true);
    setTimeout(() => setFlashEfecto(false), 200);

    // Ajustar resolución del canvas a la resolución nativa del stream
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dibujar el fotograma exacto del video
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Extraer en formato JPEG de alta calidad
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setFotoPrevia(dataUrl);
    setNotasInspeccion(`Inspección visual en ${bahiaNombre} - ${new Date().toLocaleTimeString()}`);
  };

  /**
   * Envía la imagen capturada a la API para asociarla a la Orden de Reparación activa
   */
  const handleGuardarEvidencia = async () => {
    if (!fotoPrevia) return;

    if (!ordenActiva) {
      alert("No hay una Orden de Reparación activa asignada a esta bahía.");
      return;
    }

    setCapturando(true);
    setErrorMensaje(null);

    try {
      const response = await fetch(`${apiBaseUrl}/bahias/${bahiaId}/captura`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camara_id: camaraId,
          imagen_base64: fotoPrevia,
          notas: notasInspeccion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error al guardar (${response.status})`);
      }

      const evidenciaGuardada = await response.json();
      setMensajeExito(`¡Foto guardada con éxito y vinculada a la Orden #${ordenActiva.id}!`);
      setTimeout(() => setMensajeExito(null), 4000);

      if (onCapturaExitosa) {
        onCapturaExitosa(evidenciaGuardada.id, evidenciaGuardada.archivo_path);
      }

      // Limpiar modal de captura
      setFotoPrevia(null);
      setNotasInspeccion("");
    } catch (err: any) {
      alert(`Error al registrar evidencia: ${err.message}`);
    } finally {
      setCapturando(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl bg-gray-950 text-white rounded-xl overflow-hidden shadow-2xl border border-gray-800 font-sans">
      {/* Barra superior de información */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                conexionEstado === "en_vivo"
                  ? "bg-red-500 animate-pulse"
                  : conexionEstado === "conectando"
                  ? "bg-yellow-400"
                  : "bg-gray-500"
              }`}
            />
            <span className="text-xs font-bold tracking-wider uppercase text-gray-300">
              {conexionEstado === "en_vivo" ? "EN VIVO" : conexionEstado.toUpperCase()}
            </span>
          </div>
          <h3 className="font-semibold text-sm text-gray-100">{bahiaNombre}</h3>
        </div>

        {/* Badge de Orden Activa */}
        {ordenActiva ? (
          <div className="flex items-center gap-2 bg-blue-950 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-800">
            <span className="font-semibold">Orden #{ordenActiva.id}</span>
            <span>•</span>
            <span className="text-blue-200">
              {ordenActiva.vehiculoModelo || "Vehículo"} ({ordenActiva.vehiculoPlaca || "S/P"})
            </span>
            <span className="bg-blue-800 text-blue-100 px-1.5 py-0.5 rounded text-[10px]">
              {ordenActiva.estado}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-500 italic">Bahía sin orden activa</span>
        )}
      </div>

      {/* Contenedor del reproductor de video */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {/* Flash del obturador */}
        {flashEfecto && <div className="absolute inset-0 bg-white opacity-80 z-20 transition-opacity duration-150" />}

        {/* Elemento de video HTML5 para WebRTC */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Canvas invisible para fotogramas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Pantalla de carga o reconexión */}
        {conexionEstado === "conectando" && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 z-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-300">Conectando al stream WebRTC ({streamName})...</p>
          </div>
        )}

        {/* Pantalla de error */}
        {conexionEstado === "error" && (
          <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-400 font-medium">{errorMensaje || "Falla al recibir el stream de video"}</p>
            <button
              onClick={iniciarStreamWHEP}
              className="mt-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded-md border border-gray-700 transition"
            >
              Reintentar Conexión
            </button>
          </div>
        )}

        {/* Mensaje de confirmación de captura exitosa */}
        {mensajeExito && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600/95 text-white text-xs px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-30 animate-bounce">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {mensajeExito}
          </div>
        )}
      </div>

      {/* Barra de Controles Inferior */}
      <div className="px-4 py-3 bg-gray-900 flex items-center justify-between border-t border-gray-800">
        <div className="text-xs text-gray-400">
          Cámara ID: <span className="text-gray-200 font-mono">#{camaraId}</span> | Stream:{" "}
          <span className="text-gray-200 font-mono">{streamName}</span>
        </div>

        {/* Botón de Captura Rápida de Inspección */}
        <button
          onClick={handleTomarFotoInspeccion}
          disabled={conexionEstado !== "en_vivo" || !ordenActiva}
          title={
            !ordenActiva
              ? "Requiere una Orden activa en esta bahía para adjuntar fotos"
              : "Tomar fotograma actual de inspección"
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition shadow-md ${
            conexionEstado === "en_vivo" && ordenActiva
              ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Tomar foto de inspección
        </button>
      </div>

      {/* Modal / Bandeja de confirmación del fotograma capturado */}
      {fotoPrevia && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-40 flex flex-col p-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h4 className="font-semibold text-sm text-gray-100 flex items-center gap-2">
              <span>📸</span> Vista previa de evidencia de inspección (Orden #{ordenActiva?.id})
            </h4>
            <button
              onClick={() => setFotoPrevia(null)}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded"
            >
              ✕ Descartar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto py-4">
            {/* Imagen previa */}
            <div className="relative rounded-lg overflow-hidden border border-gray-700 aspect-video bg-black flex items-center justify-center">
              <img src={fotoPrevia} alt="Fotograma capturado" className="w-full h-full object-contain" />
            </div>

            {/* Formulario de notas */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Notas de inspección / Hallazgos técnicos:
                </label>
                <textarea
                  value={notasInspeccion}
                  onChange={(e) => setNotasInspeccion(e.target.value)}
                  rows={4}
                  placeholder="Ej: Fuga de aceite detectada en retén de horquilla delantera..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  Esta fotografía se almacenará permanentemente en el servidor y quedará vinculada al historial de la
                  Orden #{ordenActiva?.id} para el cliente.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setFotoPrevia(null)}
                  disabled={capturando}
                  className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 hover:bg-gray-700 text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardarEvidencia}
                  disabled={capturando}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow"
                >
                  {capturando ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando evidencia...
                    </>
                  ) : (
                    "Confirmar y Guardar Evidencia"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

