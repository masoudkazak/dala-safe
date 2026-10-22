import { useI18n } from '../../i18n';
import { Card, FeatureStatus, PageHeader } from '../../ui';
import type { FeatureState } from '../../domain/types';
import {
  FEATURE_COUNT_BY_STATE,
  FEATURE_REGISTRY,
  FEATURE_STATES,
  type FeatureRegistryEntry,
} from './featureStatus';

function FeatureCard({ feature }: { feature: FeatureRegistryEntry }) {
  const { t, td } = useI18n();
  return (
    <li>
      <Card>
        <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 style={{ margin: 0 }}>{td(feature.label)}</h4>
          <FeatureStatus state={feature.state} />
        </div>
        <p className="card__body small" style={{ marginTop: 8 }}>
          {td(feature.note)}
        </p>
        {feature.productionNote && feature.state !== 'available' ? (
          <p className="small" style={{ marginTop: 12, marginBottom: 0 }}>
            <strong>{t('demo:demo.needsProduction')}: </strong>
            {td(feature.productionNote)}
          </p>
        ) : null}
      </Card>
    </li>
  );
}

function StateSection({ state }: { state: FeatureState }) {
  const { t } = useI18n();
  const features = FEATURE_REGISTRY.filter((feature) => feature.state === state);
  if (features.length === 0) return null;
  const headingId = `feature-state-${state}`;
  return (
    <section className="stack" aria-labelledby={headingId}>
      <h3 id={headingId}>
        {t(`featureStatus.${state}`)} ({features.length})
      </h3>
      <ul className="list-reset stack">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </ul>
    </section>
  );
}

export function FeatureStatusPage() {
  const { t } = useI18n();
  return (
    <div className="stack">
      <PageHeader title={t('demo:demo.title')} lead={t('demo:demo.subtitle')} />

      <div className="alert alert--info" role="status">
        <p style={{ margin: 0 }}>{t('demo:demo.banner')}</p>
      </div>

      <section className="stack" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title">{t('demo:demo.roadmap.title')}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <caption className="small muted" style={{ textAlign: 'left', paddingBottom: 8 }}>
            {t('demo:demo.roadmap.caption')}
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: 'left', padding: '4px 8px 4px 0' }}>
                {t('demo:demo.roadmap.statusColumn')}
              </th>
              <th scope="col" style={{ textAlign: 'right', padding: '4px 8px 4px 0' }}>
                {t('demo:demo.roadmap.countColumn')}
              </th>
              <th scope="col" style={{ textAlign: 'left', padding: '4px 0 4px 8px' }}>
                {t('demo:demo.roadmap.meaningColumn')}
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_STATES.map((state) => (
              <tr key={state}>
                <th scope="row" style={{ textAlign: 'left', padding: '8px 8px 8px 0', verticalAlign: 'top' }}>
                  <FeatureStatus state={state} />
                </th>
                <td style={{ textAlign: 'right', padding: '8px 8px 8px 0', verticalAlign: 'top' }}>
                  {FEATURE_COUNT_BY_STATE[state]}
                </td>
                <td className="small" style={{ textAlign: 'left', padding: '8px 0 8px 8px', verticalAlign: 'top' }}>
                  {t(`featureStatus.${state}.description`)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" style={{ textAlign: 'left', padding: '8px 8px 8px 0' }}>
                {t('demo:demo.roadmap.total')}
              </th>
              <td style={{ textAlign: 'right', padding: '8px 8px 8px 0' }}>{FEATURE_REGISTRY.length}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="stack" aria-labelledby="roadmap-features-title">
        <h2 id="roadmap-features-title">{t('demo:demo.roadmap.featuresTitle')}</h2>
        {FEATURE_STATES.map((state) => (
          <StateSection key={state} state={state} />
        ))}
      </section>
    </div>
  );
}
