import { useCallback } from 'react';
import { useI18n } from '../../i18n';

const DEMO_NAMESPACE_PREFIX = 'demo.';

export function useDemoTranslation() {
  const { t } = useI18n();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      key.startsWith(DEMO_NAMESPACE_PREFIX) ? t(`demo:${key}`, vars) : t(key, vars),
    [t],
  );
}
