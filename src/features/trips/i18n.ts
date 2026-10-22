import { useI18n } from '../../i18n';

const NAMESPACED_PREFIXES = new Set(['trips', 'checklist', 'safety']);

export function useTripsI18n() {
  const { t: rawT, td, language } = useI18n();
  const t = (key: string, vars?: Record<string, string | number>) => {
    const dot = key.indexOf('.');
    const prefix = dot === -1 ? '' : key.slice(0, dot);
    return rawT(NAMESPACED_PREFIXES.has(prefix) ? `${prefix}:${key}` : key, vars);
  };
  return { t, td, language };
}
