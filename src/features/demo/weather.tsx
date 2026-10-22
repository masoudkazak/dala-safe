import { useState } from 'react';
import type { FeatureState } from '../../domain/types';
import { useDemoTranslation } from './demoI18n';
import { Badge, Card, type BadgeTone } from '../../ui';
import { DemoFrame } from './DemoFrame';

export const WEATHER_STATE: FeatureState = 'requires-integration';

type HazardId = 'avalanche' | 'storm';

interface SampleDay {
  id: string;
  nameKey: string;
  highC: number;
  lowC: number;
  windMs: number;
  windDirKey: string;
  precipMm: number;
  precipPct: number;
  conditionKey: string;
  conditionTone: BadgeTone;
  hazards: HazardId[];
}

export const SAMPLE_DAYS: SampleDay[] = [
  {
    id: 'day-1',
    nameKey: 'demo.weather.day.one',
    highC: 8,
    lowC: -1,
    windMs: 4,
    windDirKey: 'demo.weather.dir.nw',
    precipMm: 0,
    precipPct: 10,
    conditionKey: 'demo.weather.condition.clear',
    conditionTone: 'success',
    hazards: [],
  },
  {
    id: 'day-2',
    nameKey: 'demo.weather.day.two',
    highC: 5,
    lowC: -3,
    windMs: 9,
    windDirKey: 'demo.weather.dir.n',
    precipMm: 6,
    precipPct: 70,
    conditionKey: 'demo.weather.condition.snow',
    conditionTone: 'info',
    hazards: ['avalanche'],
  },
  {
    id: 'day-3',
    nameKey: 'demo.weather.day.three',
    highC: 3,
    lowC: -6,
    windMs: 14,
    windDirKey: 'demo.weather.dir.ne',
    precipMm: 12,
    precipPct: 90,
    conditionKey: 'demo.weather.condition.storm',
    conditionTone: 'warning',
    hazards: ['avalanche', 'storm'],
  },
];

const HAZARD_CONTENT: Record<HazardId, { titleKey: string; bodyKey: string; tone: BadgeTone }> = {
  avalanche: {
    titleKey: 'demo.weather.hazard.avalanche.title',
    bodyKey: 'demo.weather.hazard.avalanche.body',
    tone: 'danger',
  },
  storm: {
    titleKey: 'demo.weather.hazard.storm.title',
    bodyKey: 'demo.weather.hazard.storm.body',
    tone: 'warning',
  },
};

export function WeatherDemo() {
  const t = useDemoTranslation();
  const [dayId, setDayId] = useState<string>(SAMPLE_DAYS[0].id);
  const day = SAMPLE_DAYS.find((item) => item.id === dayId) ?? SAMPLE_DAYS[0];

  return (
    <DemoFrame state={WEATHER_STATE}>
      <div className="alert alert--warning" role="status">
        <strong>{t('demo.weather.banner.title')}</strong>
        <p style={{ margin: '4px 0 0' }}>{t('demo.weather.banner.body')}</p>
      </div>

      <Card title={t('demo.weather.title')}>
        <p className="card__body">{t('demo.weather.lead')}</p>

        <div className="cluster" role="group" aria-label={t('demo.weather.dayLabel')} style={{ margin: '12px 0' }}>
          {SAMPLE_DAYS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`button ${day.id === item.id ? 'button--primary' : 'button--secondary'}`}
              aria-pressed={day.id === item.id}
              onClick={() => setDayId(item.id)}
            >
              {t(item.nameKey)}
            </button>
          ))}
        </div>

        <div aria-live="polite">
          <section aria-label={t('demo.weather.dayLabel')}>
            <div className="cluster" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>{t(day.nameKey)}</h3>
              <Badge tone={day.conditionTone}>{t(day.conditionKey)}</Badge>
            </div>

            <dl className="definition-list">
              <div>
                <dt>{t('demo.weather.temp')}</dt>
                <dd>{t('demo.weather.tempValue', { high: day.highC, low: day.lowC })}</dd>
              </div>
              <div>
                <dt>{t('demo.weather.wind')}</dt>
                <dd>{t('demo.weather.windValue', { value: day.windMs, direction: t(day.windDirKey) })}</dd>
              </div>
              <div>
                <dt>{t('demo.weather.precip')}</dt>
                <dd>{t('demo.weather.precipValue', { mm: day.precipMm, percent: day.precipPct })}</dd>
              </div>
            </dl>
          </section>
        </div>
      </Card>

      <Card title={t('demo.weather.hazards.title')}>
        <p className="small muted" style={{ marginTop: 0 }}>
          {t('demo.weather.hazards.note')}
        </p>
        {day.hazards.length === 0 ? (
          <p className="card__body" style={{ margin: 0 }}>
            {t('demo.weather.hazard.none')}
          </p>
        ) : (
          <ul className="list-reset stack stack--tight">
            {day.hazards.map((hazard) => {
              const content = HAZARD_CONTENT[hazard];
              return (
                <li key={hazard} className="card card--flat">
                  <div className="cluster" style={{ justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{t(content.titleKey)}</h3>
                    <Badge tone={content.tone}>{t('state.sampleData')}</Badge>
                  </div>
                  <p className="small" style={{ margin: '8px 0 0' }}>
                    {t(content.bodyKey)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <p className="tiny muted" style={{ marginBottom: 0 }}>
          {t('demo.weather.hazards.disclaimer')}
        </p>
      </Card>
    </DemoFrame>
  );
}
