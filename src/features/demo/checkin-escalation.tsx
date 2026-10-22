import { useState } from 'react';
import type { FeatureState } from '../../domain/types';
import { useDemoTranslation } from './demoI18n';
import { Badge, Button, Card } from '../../ui';
import { DemoFrame } from './DemoFrame';

export const CHECKIN_STATE: FeatureState = 'requires-integration';

const STEP_IDS = ['scheduled', 'missed', 'draft'] as const;
export type CheckinStepId = (typeof STEP_IDS)[number];

const STEP_META: Record<
  CheckinStepId,
  { titleKey: string; bodyKey: string; time: string; tone: 'neutral' | 'warning' | 'danger' }
> = {
  scheduled: {
    titleKey: 'demo.checkin.step.scheduled.title',
    bodyKey: 'demo.checkin.step.scheduled.body',
    time: '18:00',
    tone: 'neutral',
  },
  missed: {
    titleKey: 'demo.checkin.step.missed.title',
    bodyKey: 'demo.checkin.step.missed.body',
    time: '18:35',
    tone: 'warning',
  },
  draft: {
    titleKey: 'demo.checkin.step.draft.title',
    bodyKey: 'demo.checkin.step.draft.body',
    time: '18:36',
    tone: 'danger',
  },
};

export function CheckinEscalationDemo() {
  const t = useDemoTranslation();
  const [reached, setReached] = useState<readonly CheckinStepId[]>(['scheduled']);

  const current = reached[reached.length - 1];
  const isComplete = current === 'draft';

  const advance = () => {
    if (isComplete) return;
    const next = current === 'scheduled' ? 'missed' : 'draft';
    setReached([...reached, next]);
  };

  const reset = () => setReached(['scheduled']);

  return (
    <DemoFrame state={CHECKIN_STATE}>
      <div className="alert alert--info" role="status">
        <strong>{t('demo.checkin.simulated.title')}</strong>
        <p style={{ margin: '4px 0 0' }}>{t('demo.checkin.simulated.body')}</p>
      </div>

      <Card title={t('demo.checkin.title')}>
        <p className="card__body">{t('demo.checkin.lead')}</p>
        <p className="small muted">{t('demo.checkin.trustedContact')}</p>

        <ol className="stack stack--tight" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {STEP_IDS.filter((id) => reached.includes(id)).map((id) => {
            const meta = STEP_META[id];
            return (
              <li key={id} className="card card--flat">
                <div className="cluster" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{t(meta.titleKey)}</h3>
                  <div className="cluster" style={{ rowGap: 6 }}>
                    <Badge tone={meta.tone}>
                      <time dateTime={meta.time}>{meta.time}</time>
                    </Badge>
                    <Badge tone="info">{t('state.sampleData')}</Badge>
                  </div>
                </div>
                <p className="small" style={{ margin: '8px 0 0' }}>
                  {t(meta.bodyKey)}
                </p>
                {id === 'draft' ? (
                  <div className="cluster" style={{ marginTop: 8, rowGap: 6 }}>
                    <Badge tone="warning">{t('demo.checkin.requiresIntegration')}</Badge>
                    <Badge tone="neutral">{t('demo.checkin.neverTransmitted')}</Badge>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="cluster" style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={advance} disabled={isComplete}>
            {t(current === 'scheduled' ? 'demo.checkin.simulate' : 'demo.checkin.advance')}
          </Button>
          <Button variant="secondary" onClick={reset}>
            {t('demo.checkin.reset')}
          </Button>
        </div>

        <p className="small" role="status" aria-live="polite" style={{ minHeight: '1.5em', marginBottom: 0 }}>
          {t('demo.checkin.current', { step: t(STEP_META[current].titleKey) })}
        </p>
      </Card>
    </DemoFrame>
  );
}
