import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import es, { type TranslationKey } from '../i18n/es';
import en from '../i18n/en';

type Lang = 'es' | 'en';
type Translations = typeof es;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const translations: Record<Lang, Translations> = { es, en: en as unknown as Translations };

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');

  const t = (key: TranslationKey): string =>
    translations[lang][key] ?? translations['es'][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
