import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import {
  Camera,
  Maximize2,
  Video,
  VideoOff,
  Loader2,
  Tag
} from 'lucide-react';
import type { BahiaDetail, Camara } from '../types';

interface BahiaCameraViewerProps {
  bahia: BahiaDetail;
  camara?: Camara;
  onCaptureFrame: (captureData: {
    blob: Blob;
    dataUrl: string;
    bahiaId: number;
    camaraId?: number;
    ordenId?: number;
    bahiaNombre: string;
  }) => void;
}

export default function BahiaCameraViewer({
  bahia,
  camara,
  onCaptureFrame,
}: BahiaCameraViewerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // URL del stream: Si es HLS (m3u8), lo consume con Hls.js;
  // si es demo o mp4, usa video HTML5 nativo; si es RTSP nativo, apunta al puente MediaMTX / go2rtc
  const streamUrl = React.useMemo(() => {
    if (!camara?.url_rtsp) {
      // Mock stream de taller para demostración y testing interactivo
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    }
    const raw = camara.url_rtsp;
    // Si viene en formato rtsp://, convertirlo a la URL HLS que expone MediaMTX por defecto
    if (raw.startsWith('rtsp://')) {
      const cleanPath = raw.split('/').pop() || `bahia_${bahia.id}`;
      return `http://localhost:8888/${cleanPath}/index.m3u8`;
    }
    return raw;
  }, [camara?.url_rtsp, bahia.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    setStreamError(false);
    setIsPlaying(false);

    const isHlsStream = streamUrl.includes('.m3u8');

    if (isHlsStream) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 0,
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setStreamError(true);
            hls?.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Soporte nativo HLS (ej. Safari en iPad / iOS)
        video.src = streamUrl;
        video.play().catch(() => setIsPlaying(false));
      } else {
        setStreamError(true);
      }
    } else {
      // Video MP4 o stream directo
      video.src = streamUrl;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.play().catch((err) => {
        console.warn('Auto-play diferido hasta interacción:', err);
      });
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => setStreamError(true);

    video.addEventListener('playing', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('playing', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  // Capturar fotograma desde el elemento <video> usando <canvas>
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsCapturing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No se pudo inicializar contexto 2D de canvas');
      }

      // Dibujar fotograma
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Sello de agua técnico opcional
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      const fecha = new Date().toLocaleString('es-MX');
      const orInfo = bahia.orden_activa ? ` | OR #${bahia.orden_activa.id}` : ' | Sin Orden';
      ctx.fillText(`CÁMARA ${bahia.nombre_bahia}${orInfo} - ${fecha}`, 16, canvas.height - 15);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCaptureFrame({
              blob,
              dataUrl,
              bahiaId: bahia.id,
              camaraId: camara?.id,
              ordenId: bahia.orden_activa?.id,
              bahiaNombre: bahia.nombre_bahia,
            });
          }
          setIsCapturing(false);
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Error al capturar fotograma:', err);
      setIsCapturing(false);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    } else {
      video.parentElement?.requestFullscreen().catch(console.error);
    }
  };

  return (
    <div className="relative group bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-md flex flex-col justify-between aspect-video">
      {/* Contenedor del Video */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          muted
          playsInline
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
        />

        {/* Fallback de error o sin cámara */}
        {streamError && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
            <VideoOff className="w-8 h-8 text-rose-400" />
            <p className="text-xs font-semibold text-slate-200">Señal de video no disponible</p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Verifique conexión RTSP o servidor MediaMTX ({camara?.url_rtsp || 'Sin RTSP'})
            </p>
          </div>
        )}
      </div>

      {/* Barra superior con badges informativos */}
      <div className="relative z-10 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-md border border-slate-700/60">
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            {bahia.nombre_bahia}
          </span>

          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
              isPlaying
                ? 'bg-rose-500/80 text-white animate-pulse'
                : 'bg-slate-800/80 text-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {isPlaying ? 'EN VIVO' : 'PAUSADO'}
          </span>
        </div>

        {/* Orden activa en la bahía */}
        <div>
          {bahia.orden_activa ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/80 text-white backdrop-blur-md shadow-xs">
              <Tag className="w-3 h-3" />
              OR #{bahia.orden_activa.id}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-400 backdrop-blur-md">
              Bahía Disponible
            </span>
          )}
        </div>
      </div>

      {/* Controles flotantes inferiores */}
      <div className="relative z-10 p-3.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between opacity-95 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-300 font-mono">
            {camara ? `CAM-${camara.id}` : 'CAM-01'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de Captura Rápida de Fotograma */}
          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-900/40 transition-all cursor-pointer touch-manipulation disabled:opacity-50"
            title="Tomar fotograma de inspección"
          >
            {isCapturing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            <span>Capturar Fotograma</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white text-xs transition-colors backdrop-blur-md"
            title="Pantalla completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
