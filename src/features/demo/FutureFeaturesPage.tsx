import { useState } from 'react';
import { Badge, Button, ButtonLink, Card, FeatureStatus, PageHeader } from '../../ui';
import { useDemoTranslation } from './demoI18n';
import { listDemoDefinitions } from './registry';
import { resetDemoStorage } from './demoStorage';

export function FutureFeaturesPage() {
  const t = useDemoTranslation();
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const demos = listDemoDefinitions();

  const handleReset = () => {
    resetDemoStorage();
    setResetMessage(t('demo.future.resetDone'));
  };

  return (
    <div className="stack">
      <PageHeader
        eyebrow={<Badge tone="info">{t('state.sampleData')}</Badge>}
        title={t('demo.title')}
        lead={t('demo.subtitle')}
      />

      <div className="alert alert--info" role="status">
        <strong>{t('demo.future.bannerTitle')}</strong>
        <p style={{ margin: '4px 0 0' }}>{t('demo.banner')}</p>
      </div>

      <Card title={t('demo.future.resetTitle')}>
        <p className="card__body">{t('demo.future.resetHint')}</p>
        <div className="cluster" style={{ marginTop: 8 }}>
          <Button variant="secondary" onClick={handleReset}>
            {t('demo.reset')}
          </Button>
        </div>
        <p className="small" role="status" aria-live="polite" style={{ minHeight: '1.5em', marginBottom: 0 }}>
          {resetMessage ?? ''}
        </p>
      </Card>

      <section className="stack" aria-labelledby="demo-list-title">
        <h2 id="demo-list-title">{t('demo.future.listTitle')}</h2>
        <p className="small muted" style={{ marginTop: -8 }}>
          {t('demo.sampleNotice')}
        </p>
        <ul className="list-reset stack">
          {demos.map((demo) => (
            <li key={demo.id}>
              <Card>
                <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0 }}>{t(demo.titleKey)}</h3>
                  <FeatureStatus state={demo.state} />
                </div>
                <p className="card__body small" style={{ marginTop: 8 }}>
                  {t(demo.summaryKey)}
                </p>
                <div className="cluster" style={{ marginTop: 12 }}>
                  <ButtonLink to={`/future/${demo.id}`} variant="primary" size="sm">
                    {t('demo.open')}
                  </ButtonLink>
                  <Badge tone="neutral">{demo.id}</Badge>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
