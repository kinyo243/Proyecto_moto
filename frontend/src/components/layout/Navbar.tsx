import { useEffect, useState } from 'react';
import { Menu, Globe, RefreshCw, DollarSign, Euro, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../api/client';
import { getTasasBCV, type TasasBCV } from '../../api/endpoints/bcv';

interface NavbarProps {
  onMenuClick: () => void;
}

type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  connected: 'bg-green-500',
  disconnected: 'bg-red-500',
  checking: 'bg-yellow-400',
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('checking');

  // Tasas BCV en tiempo real para el ticker superior en el Navbar
  const [tasas, setTasas] = useState<TasasBCV | null>(null);
  const [loadingTasas, setLoadingTasas] = useState<boolean>(false);

  const fetchTasas = async (force = false) => {
    try {
      setLoadingTasas(true);
      const res = await getTasasBCV(force);
      setTasas(res.data);
    } catch (err) {
      console.error('Error obteniendo tasas BCV:', err);
    } finally {
      setLoadingTasas(false);
    }
  };

  const checkHealth = async () => {
    try {
      await apiClient.get('/health', { baseURL: 'http://localhost:8000' });
      setConnStatus('connected');
    } catch {
      setConnStatus('disconnected');
    }
  };

  useEffect(() => {
    checkHealth();
    fetchTasas();

    const healthInterval = setInterval(checkHealth, 30_000);
    // Refrescar tasas automáticamente cada 5 minutos
    const tasasInterval = setInterval(() => fetchTasas(false), 300_000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(tasasInterval);
    };
  }, []);

  const connLabel =
    connStatus === 'connected'
      ? t('conn.connected')
      : connStatus === 'disconnected'
        ? t('conn.disconnected')
        : t('conn.checking');

  const formatMontoBs = (monto: number) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(monto);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Lado Izquierdo: Botón Menú Mobile */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Ticker Central Superior: Tasas Oficiales BCV (USD / EUR) Siempre Visibles */}
      <div className="flex-1 flex items-center justify-center max-w-xl mx-auto">
        <div
          className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs shadow-xs transition-all hover:border-slate-300"
          title={
            tasas?.fecha_valor
              ? `Banco Central de Venezuela (BCV) | Fecha Valor: ${tasas.fecha_valor}`
              : 'Tasas Oficiales Banco Central de Venezuela'
          }
        >
          {/* Logo / Badge BCV */}
          <div className="flex items-center gap-1 font-semibold text-slate-700 border-r border-slate-200 pr-2">
            <Building2 size={13} className="text-primary-600 hidden sm:inline" />
            <span className="tracking-wide text-[11px] font-bold text-slate-800">BCV</span>
          </div>

          {/* Dólar Oficial */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
              <DollarSign size={10} />
            </span>
            <span className="font-semibold text-slate-600 hidden md:inline">USD:</span>
            {loadingTasas && !tasas ? (
              <span className="text-slate-400 font-mono text-[11px] animate-pulse">Cargando...</span>
            ) : tasas?.usd ? (
              <span className="font-bold text-emerald-700 font-mono text-[12px]">
                Bs. {formatMontoBs(tasas.usd)}
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">N/D</span>
            )}
          </div>

          <span className="text-slate-300 font-light">•</span>

          {/* Euro Oficial */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
              <Euro size={10} />
            </span>
            <span className="font-semibold text-slate-600 hidden md:inline">EUR:</span>
            {loadingTasas && !tasas ? (
              <span className="text-slate-400 font-mono text-[11px] animate-pulse">Cargando...</span>
            ) : tasas?.eur ? (
              <span className="font-bold text-blue-700 font-mono text-[12px]">
                Bs. {formatMontoBs(tasas.eur)}
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">N/D</span>
            )}
          </div>

          {/* Botón de Sincronización Manual */}
          <button
            onClick={() => fetchTasas(true)}
            disabled={loadingTasas}
            className={`p-1 rounded-full text-slate-400 hover:text-primary-600 hover:bg-slate-200/60 transition-all ${
              loadingTasas ? 'animate-spin text-primary-600' : ''
            }`}
            title="Actualizar tasas oficiales desde el BCV ahora"
            aria-label="Actualizar tasas BCV"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Lado Derecho: Estado de Conexión + Idioma */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[connStatus]}`} />
          <span className="text-xs text-gray-500 hidden sm:inline">{connLabel}</span>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          title="Cambiar idioma"
        >
          <Globe size={14} />
          {lang.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
