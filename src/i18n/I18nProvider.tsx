import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getBrowserStorage } from '../data/storage';
import { loadSettings, saveSettings } from '../data/settingsRepository';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language, type LocalizedText } from '../domain/types';
import { translate } from './translate';

const storage = getBrowserStorage();

export interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  td: (text: LocalizedText | undefined) => string;
  availableLanguages: Language[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => loadSettings(storage).language ?? DEFAULT_LANGUAGE);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(next)) return;
    setLanguageState(next);
    const settings = loadSettings(storage);
    saveSettings(storage, { ...settings, language: next });
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(language, key, vars, (missing) => {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] missing key: ${missing}`);
        }
      }),
    [language],
  );

  const td = useCallback(
    (text: LocalizedText | undefined) => {
      if (!text) return '';
      const value = text[language];
      if (value) return value;
      return text.en ?? '';
    },
    [language],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t, td, availableLanguages: SUPPORTED_LANGUAGES }),
    [language, setLanguage, t, td],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
