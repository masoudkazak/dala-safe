export type SafetyTranslate = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

export function translateSafety(
  translate: SafetyTranslate,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const namespacedKey = `safety:${key}`;
  const namespaced = translate(namespacedKey, vars);
  if (namespaced !== namespacedKey) return namespaced;

  const direct = translate(key, vars);
  if (direct !== key) return direct;

  return translate(`safety:${key.replace(/^safety\./, '')}`, vars);
}
