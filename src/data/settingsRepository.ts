import { isRecord, readEnvelope, STORAGE_KEYS, writeEnvelope, type StorageLike } from './storage';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type AppSettings, type Language } from '../domain/types';

export const DEFAULT_SETTINGS: AppSettings = {
  language: DEFAULT_LANGUAGE,
  units: 'metric',
  onboardingComplete: false,
};

export function isSettings(value: unknown): value is AppSettings {
  if (!isRecord(value)) return false;
  return (
    typeof value.language === 'string' &&
    SUPPORTED_LANGUAGES.includes(value.language as Language) &&
    value.units === 'metric' &&
    typeof value.onboardingComplete === 'boolean'
  );
}

export function loadSettings(storage: StorageLike): AppSettings {
  const { data } = readEnvelope(storage, STORAGE_KEYS.settings, isSettings);
  return data ?? { ...DEFAULT_SETTINGS };
}

export function saveSettings(storage: StorageLike, settings: AppSettings): boolean {
  return writeEnvelope(storage, STORAGE_KEYS.settings, settings).ok;
}
