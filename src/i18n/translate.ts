import type { Language } from '../domain/types';
import { NAMESPACES, RESOURCES, type Namespace } from './resources';

export function resolveKey(key: string): { namespace: Namespace | null; path: string } {
  const separator = key.indexOf(':');
  if (separator === -1) return { namespace: null, path: key };
  return {
    namespace: key.slice(0, separator) as Namespace,
    path: key.slice(separator + 1),
  };
}

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

function lookup(language: Language, namespace: Namespace, path: string): string | undefined {
  const value = RESOURCES[language]?.[namespace]?.[path];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function translate(
  language: Language,
  key: string,
  vars?: Record<string, string | number>,
  warn: (key: string) => void = () => undefined,
): string {
  const { namespace, path } = resolveKey(key);
  const candidates: Namespace[] = namespace !== null ? [namespace] : ['common', ...NAMESPACES.filter((n) => n !== 'common')];

  for (const candidate of candidates) {
    const primary = lookup(language, candidate, path);
    if (primary) return interpolate(primary, vars);
  }
  for (const candidate of candidates) {
    const fallback = lookup('en', candidate, path);
    if (fallback) {
      warn(key);
      return interpolate(fallback, vars);
    }
  }
  warn(key);
  return key;
}
