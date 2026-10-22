import { useParams } from 'react-router-dom';
import { ButtonLink, Card, EmptyState, FeatureStatus, PageHeader } from '../../ui';
import { useDemoTranslation } from './demoI18n';
import { getDemoDefinition } from './registry';

export function DemoDetailPage() {
  const t = useDemoTranslation();
  const { demoId } = useParams<{ demoId: string }>();
  const definition = demoId ? getDemoDefinition(demoId) : null;

  if (!definition) {
    return (
      <div className="stack">
        <PageHeader title={t('demo.title')} />
        <EmptyState
          title={t('demo.notFound')}
          body={t('demo.notFoundBody')}
          action={<ButtonLink to="/future">{t('demo.back')}</ButtonLink>}
        />
      </div>
    );
  }

  const Demo = definition.component;

  return (
    <div className="stack">
      <div className="cluster">
        <ButtonLink to="/future" variant="ghost" size="sm">
          ← {t('demo.back')}
        </ButtonLink>
      </div>

      <PageHeader title={t(definition.titleKey)} lead={t(definition.summaryKey)} />

      <Card flat>
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <FeatureStatus state={definition.state} />
          <span className="tiny muted">{definition.id}</span>
        </div>
      </Card>

      <Demo />

      <Card title={t('demo.needsProduction')}>
        <p className="card__body" style={{ margin: 0 }}>
          {t(definition.productionKey)}
        </p>
      </Card>
    </div>
  );
}
