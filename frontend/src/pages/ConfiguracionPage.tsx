import { useLanguage } from '../context/LanguageContext';

export default function ConfiguracionPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
      <p className="text-lg font-semibold">{t('nav.configuracion')}</p>
      <p className="text-sm">{t('misc.coming_soon')}</p>
    </div>
  );
}

