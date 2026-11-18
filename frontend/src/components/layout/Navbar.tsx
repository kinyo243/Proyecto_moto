import { useEffect, useState } from 'react';
import { Menu, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../api/client';

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
    const interval = setInterval(checkHealth, 30_000);
    return () => clearInterval(interval);
  }, []);

  const connLabel =
    connStatus === 'connected'
      ? t('conn.connected')
      : connStatus === 'disconnected'
        ? t('conn.disconnected')
        : t('conn.checking');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-900"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* Left spacer */}
      <div className="flex-1" />

      {/* Connection status */}
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[connStatus]}`}
        />
        <span className="text-xs text-gray-500 hidden sm:inline">{connLabel}</span>
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
        className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        title="Cambiar idioma"
      >
        <Globe size={14} />
        {lang.toUpperCase()}
      </button>
    </header>
  );
}

