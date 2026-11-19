import { useEffect, useState } from 'react';
import { Menu, Globe, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../api/client';
import { getTasasBCV, type TasasBCV } from '../../api/endpoints/bcv';
import { VIEW_LABEL_KEY, type ViewName } from './Sidebar';

interface NavbarProps {
  activeView: ViewName;
  onMenuClick: () => void;
}

type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

const STATUS_STYLES: Record<ConnectionStatus, { dot: string; ring: string; text: string }> = {
  connected: { dot: 'bg-emerald-500', ring: 'bg-emerald-500/30', text: 'text-emerald-700' },
  disconnected: { dot: 'bg-rose-500', ring: 'bg-rose-500/30', text: 'text-rose-700' },
  checking: { dot: 'bg-amber-400', ring: 'bg-amber-400/30', text: 'text-amber-700' },
};

const formatMontoBs = (monto: number) =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto);

function RateChip({
  code,
  value,
  loading,
  tone,
}: {
  code: 'USD' | 'EUR';
  value?: number | null;
  loading: boolean;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${tone}`}>{code}</span>
      {loading && !value ? (
        <span className="h-3.5 w-16 animate-pulse rounded bg-slate-200" />
      ) : value ? (
        <span className="num text-[13px] font-semibold text-slate-800">
          <span className="mr-0.5 text-[11px] font-medium text-slate-400">Bs</span>
          {formatMontoBs(value)}
        </span>
      ) : (
        <span className="text-[11px] text-slate-400">N/D</span>
      )}
    </div>
  );
}

export default function Navbar({ activeView, onMenuClick }: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('checking');
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

  const st = STATUS_STYLES[connStatus];
  const today = new Date().toLocaleDateString(lang === 'es' ? 'es-VE' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-6 lg:px-8">
      {/* Izquierda: menú móvil + título de la vista */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
            {t(VIEW_LABEL_KEY[activeView] as Parameters<typeof t>[0])}
          </p>
          <p className="hidden truncate text-xs text-slate-500 first-letter:uppercase sm:block">{today}</p>
        </div>
      </div>

      {/* Derecha: tasas BCV, conexión, idioma */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white py-1.5 pr-1.5 pl-3 shadow-card"
          title={
            tasas?.fecha_valor
              ? `Banco Central de Venezuela (BCV) · Fecha valor: ${tasas.fecha_valor}`
              : 'Tasas oficiales Banco Central de Venezuela'
          }
        >
          <span className="hidden text-[10px] font-bold tracking-[0.12em] text-slate-400 md:inline">BCV</span>
          <RateChip code="USD" value={tasas?.usd} loading={loadingTasas} tone="bg-emerald-50 text-emerald-700" />
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <div className="hidden sm:block">
            <RateChip code="EUR" value={tasas?.eur} loading={loadingTasas} tone="bg-violet-50 text-violet-700" />
          </div>
          <button
            onClick={() => fetchTasas(true)}
            disabled={loadingTasas}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
            title="Actualizar tasas oficiales desde el BCV ahora"
            aria-label="Actualizar tasas BCV"
          >
            <RefreshCw size={13} className={loadingTasas ? 'animate-spin text-brand-600' : ''} />
          </button>
        </div>

        <div
          className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-card md:flex"
          title={connLabel}
        >
          <span className="relative flex h-2 w-2">
            {connStatus === 'connected' && (
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${st.ring}`} />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${st.dot}`} />
          </span>
          <span className={`text-xs font-medium ${st.text}`}>{connLabel}</span>
        </div>

        <button
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 shadow-card transition-colors hover:bg-slate-50"
          title="Cambiar idioma"
        >
          <Globe size={14} />
          {lang.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
