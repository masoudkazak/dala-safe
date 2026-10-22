import { useMemo, useState, type ChangeEvent } from 'react';
import type { FeatureState } from '../../domain/types';
import { useDemoTranslation } from './demoI18n';
import { Badge, Card, EmptyState, SelectField, type BadgeTone } from '../../ui';
import { DemoFrame } from './DemoFrame';

export const RISK_STATE: FeatureState = 'requires-integration';

type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high';

const RISK_TONE: Record<RiskLevel, BadgeTone> = {
  low: 'success',
  moderate: 'info',
  elevated: 'warning',
  high: 'danger',
};

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'demo.risk.level.low',
  moderate: 'demo.risk.level.moderate',
  elevated: 'demo.risk.level.elevated',
  high: 'demo.risk.level.high',
};

interface SampleZone {
  id: string;
  nameKey: string;
  conditionKey: string;
  level: RiskLevel;
}

export const SAMPLE_ZONES: SampleZone[] = [
  {
    id: 'big-almaty-south',
    nameKey: 'demo.risk.zone.bigAlmaty',
    conditionKey: 'demo.risk.zone.bigAlmaty.condition',
    level: 'elevated',
  },
  {
    id: 'talgar-ridge',
    nameKey: 'demo.risk.zone.talgar',
    conditionKey: 'demo.risk.zone.talgar.condition',
    level: 'high',
  },
  {
    id: 'kolsai-lakes',
    nameKey: 'demo.risk.zone.kolsai',
    conditionKey: 'demo.risk.zone.kolsai.condition',
    level: 'moderate',
  },
  {
    id: 'charyn-canyon',
    nameKey: 'demo.risk.zone.charyn',
    conditionKey: 'demo.risk.zone.charyn.condition',
    level: 'low',
  },
  {
    id: 'ile-alatau-north',
    nameKey: 'demo.risk.zone.ileAlatau',
    conditionKey: 'demo.risk.zone.ileAlatau.condition',
    level: 'moderate',
  },
];

export function RegionalRiskDemo() {
  const t = useDemoTranslation();
  const [filter, setFilter] = useState<'all' | RiskLevel>('all');

  const zones = useMemo(
    () => (filter === 'all' ? SAMPLE_ZONES : SAMPLE_ZONES.filter((zone) => zone.level === filter)),
    [filter],
  );

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value as 'all' | RiskLevel);
  };

  return (
    <DemoFrame state={RISK_STATE}>
      <div className="alert alert--warning" role="note">
        <strong>{t('demo.risk.notFacility.title')}</strong>
        <p style={{ margin: '4px 0 0' }}>{t('demo.risk.notFacility.body')}</p>
      </div>

      <Card title={t('demo.risk.title')}>
        <p className="card__body">{t('demo.risk.lead')}</p>

        <SelectField
          id="demo-risk-filter"
          label={t('demo.risk.filter')}
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="all">{t('demo.risk.filter.all')}</option>
          <option value="low">{t(RISK_LABEL.low)}</option>
          <option value="moderate">{t(RISK_LABEL.moderate)}</option>
          <option value="elevated">{t(RISK_LABEL.elevated)}</option>
          <option value="high">{t(RISK_LABEL.high)}</option>
        </SelectField>

        <p className="small muted" aria-live="polite" style={{ marginBottom: 8 }}>
          {t('demo.risk.count', { count: zones.length })}
        </p>

        {zones.length === 0 ? (
          <EmptyState title={t('demo.risk.empty')} body={t('demo.risk.emptyBody')} />
        ) : (
          <ul className="list-reset stack stack--tight">
            {zones.map((zone) => (
              <li key={zone.id} className="card card--flat">
                <div className="cluster" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{t(zone.nameKey)}</h3>
                  <div className="cluster" style={{ rowGap: 6 }}>
                    <Badge tone={RISK_TONE[zone.level]}>{t(RISK_LABEL[zone.level])}</Badge>
                    <Badge tone="info">{t('state.sampleData')}</Badge>
                  </div>
                </div>
                <p className="small" style={{ margin: '8px 0 0' }}>
                  {t(zone.conditionKey)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DemoFrame>
  );
}
