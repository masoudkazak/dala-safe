import type { ReactNode } from 'react';
import type { FeatureState } from '../../domain/types';
import { FeatureStatus } from '../../ui';
import { useDemoTranslation } from './demoI18n';

export function DemoFrame({ state, children }: { state: FeatureState; children: ReactNode }) {
  const t = useDemoTranslation();
  return (
    <div className="stack">
      <FeatureStatus state={state} />
      <div className="alert alert--info" role="status">
        <strong>{t('state.sampleData')}</strong>
        <p style={{ margin: '4px 0 0' }}>{t('demo.sampleNotice')}</p>
      </div>
      {children}
    </div>
  );
}
