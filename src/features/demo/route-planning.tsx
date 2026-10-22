import { useMemo, useState, type ChangeEvent } from 'react';
import type { FeatureState } from '../../domain/types';
import { useDemoTranslation } from './demoI18n';
import { Badge, Card, InputField, SelectField } from '../../ui';
import { DemoFrame } from './DemoFrame';

export const ROUTE_PLANNING_STATE: FeatureState = 'demo';

interface SampleRoute {
  id: string;
  nameKey: string;
  distanceKm: number;
  elevations: number[];
}

export const SAMPLE_ROUTES: SampleRoute[] = [
  {
    id: 'big-almaty',
    nameKey: 'demo.route.route.bigAlmaty',
    distanceKm: 14.5,
    elevations: [2500, 2620, 2790, 3010, 3260, 3480, 3680, 3820, 3900, 3740, 3460, 3150],
  },
  {
    id: 'talgar',
    nameKey: 'demo.route.route.talgar',
    distanceKm: 21.2,
    elevations: [1800, 2050, 2380, 2700, 3050, 3400, 3750, 4050, 4280, 4020, 3500, 2900],
  },
  {
    id: 'kolsai',
    nameKey: 'demo.route.route.kolsai',
    distanceKm: 9.8,
    elevations: [1820, 1860, 1930, 2050, 2180, 2260, 2300, 2270, 2150, 2000, 1900, 1830],
  },
];

export function parseElevationInput(text: string): number[] | null {
  const parts = text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length < 2 || parts.length > 40) return null;
  const values: number[] = [];
  for (const part of parts) {
    if (!/^-?\d+(\.\d+)?$/.test(part)) return null;
    const value = Number(part);
    if (!Number.isFinite(value) || value < -100 || value > 9000) return null;
    values.push(value);
  }
  return values;
}

export function totalAscent(values: number[]): number {
  let gain = 0;
  for (let i = 1; i < values.length; i += 1) {
    const delta = values[i] - values[i - 1];
    if (delta > 0) gain += delta;
  }
  return Math.round(gain);
}

function ElevationChart({ values }: { values: number[] }) {
  const t = useDemoTranslation();
  const width = 320;
  const height = 140;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - 8 - ((value - min) / span) * (height - 20);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={t('demo.route.chart.alt', {
        points: values.length,
        min: Math.round(min),
        max: Math.round(max),
      })}
      style={{ width: '100%', height: 'auto', color: 'var(--color-primary)' }}
    >
      <line x1={0} y1={height - 1} x2={width} y2={height - 1} stroke="currentColor" strokeOpacity={0.35} />
      <polyline fill="none" stroke="currentColor" strokeWidth={2.5} points={points} />
    </svg>
  );
}

export function RoutePlanningDemo() {
  const t = useDemoTranslation();
  const [routeId, setRouteId] = useState<string>(SAMPLE_ROUTES[0].id);
  const route = SAMPLE_ROUTES.find((item) => item.id === routeId) ?? SAMPLE_ROUTES[0];
  const [elevationText, setElevationText] = useState<string>(route.elevations.join(', '));

  const parsed = useMemo(() => parseElevationInput(elevationText), [elevationText]);

  const handleRouteChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = SAMPLE_ROUTES.find((item) => item.id === event.target.value) ?? SAMPLE_ROUTES[0];
    setRouteId(next.id);
    setElevationText(next.elevations.join(', '));
  };

  return (
    <DemoFrame state={ROUTE_PLANNING_STATE}>
      <Card title={t('demo.route.title')}>
        <p className="card__body">{t('demo.route.lead')}</p>

        <div className="cluster" style={{ margin: '12px 0' }}>
          <Badge tone="info">{t('state.sampleData')}</Badge>
        </div>

        <SelectField
          id="demo-route-select"
          label={t('demo.route.selector')}
          value={routeId}
          onChange={handleRouteChange}
        >
          {SAMPLE_ROUTES.map((item) => (
            <option key={item.id} value={item.id}>
              {t(item.nameKey)}
            </option>
          ))}
        </SelectField>

        <InputField
          id="demo-route-elevations"
          label={t('demo.route.elevations')}
          hint={t('demo.route.elevations.hint')}
          error={parsed === null ? t('demo.route.elevations.invalid') : undefined}
          value={elevationText}
          onChange={(event) => setElevationText(event.target.value)}
          inputMode="numeric"
          autoComplete="off"
        />
      </Card>

      <Card title={t('demo.route.chart.title')}>
        {parsed ? (
          <div className="stack stack--tight">
            <ElevationChart values={parsed} />
            <dl className="definition-list">
              <div>
                <dt>{t('demo.route.distance')}</dt>
                <dd>{t('demo.route.km', { value: route.distanceKm.toFixed(1) })}</dd>
              </div>
              <div>
                <dt>{t('demo.route.gain')}</dt>
                <dd>{t('demo.route.meters', { value: totalAscent(parsed) })}</dd>
              </div>
              <div>
                <dt>{t('demo.route.min')}</dt>
                <dd>{t('demo.route.meters', { value: Math.round(Math.min(...parsed)) })}</dd>
              </div>
              <div>
                <dt>{t('demo.route.max')}</dt>
                <dd>{t('demo.route.meters', { value: Math.round(Math.max(...parsed)) })}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="small muted" style={{ margin: 0 }}>
            {t('demo.route.chart.hidden')}
          </p>
        )}
        <p className="tiny muted" style={{ marginBottom: 0 }}>
          {t('demo.route.chart.sampleNote')}
        </p>
      </Card>
    </DemoFrame>
  );
}
