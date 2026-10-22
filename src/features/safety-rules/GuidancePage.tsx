import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip, useTrips } from '../../data/TripsProvider';
import { EMPTY_READINESS } from '../../domain/trip';
import type {
  ConnectivityValue,
  GroupExperienceValue,
  GuidanceInputKey,
  RouteTypeValue,
} from './engine';
import { evaluateGuidance, inputCompleteness } from './engine';
import { GUIDANCE_CATALOG } from './catalog';
import type { ReadinessAnswers, ReviewStatus } from '../../domain/types';
import { useI18n } from '../../i18n';
import { translateSafety } from './i18n';
import { Badge, Button, ButtonLink, Card, InputField, PageHeader, SelectField } from '../../ui';

const INPUT_LABEL_KEYS: Record<GuidanceInputKey, string> = {
  durationHours: 'safety.duration',
  groupExperience: 'safety.experience',
  connectivity: 'safety.connectivity',
  forecastAvailable: 'safety.forecast',
  routeType: 'safety.route',
};

function reviewStatusKey(status: ReviewStatus): string {
  return `safety.reviewStatus.${status}`;
}

function severityTone(severity: 'info' | 'caution' | 'critical'): 'info' | 'warning' | 'danger' {
  if (severity === 'critical') return 'danger';
  if (severity === 'caution') return 'warning';
  return 'info';
}

export function GuidancePage() {
  const { t: translate, td, language } = useI18n();
  const t = (key: string, vars?: Record<string, string | number>) => translateSafety(translate, key, vars);
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const { updateTrip } = useTrips();

  const [answers, setAnswers] = useState<ReadinessAnswers>(() => ({
    ...(trip?.readiness ?? EMPTY_READINESS),
  }));
  const [activeTripId, setActiveTripId] = useState(trip?.id ?? '');
  const [saved, setSaved] = useState(false);

  if (trip && trip.id !== activeTripId) {
    setActiveTripId(trip.id);
    setAnswers({ ...trip.readiness });
    setSaved(false);
  }

  const matches = useMemo(() => evaluateGuidance(answers, { language }), [answers, language]);
  const completeness = useMemo(() => inputCompleteness(answers), [answers]);

  if (!trip) {
    return (
      <div className="stack">
        <PageHeader title={t('safety.tripNotFound.title')} lead={t('safety.tripNotFound.body')} />
        <div>
          <ButtonLink to="/trips" variant="secondary">
            {t('safety.tripNotFound.back')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const durationInvalid =
    answers.durationHours !== null && (!Number.isFinite(answers.durationHours) || answers.durationHours <= 0);
  const missingLabels = completeness.missing.map((key) => t(INPUT_LABEL_KEYS[key])).join(', ');

  const updateAnswer = <Key extends keyof ReadinessAnswers>(key: Key, value: ReadinessAnswers[Key]) => {
    setSaved(false);
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const onDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw.trim() === '') {
      updateAnswer('durationHours', null);
      return;
    }
    const parsed = Number(raw);
    updateAnswer('durationHours', Number.isFinite(parsed) ? parsed : null);
  };

  const onExperienceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    updateAnswer('groupExperience', value === '' ? null : (value as GroupExperienceValue));
  };

  const onConnectivityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    updateAnswer('connectivity', value === '' ? null : (value as ConnectivityValue));
  };

  const onForecastChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    updateAnswer('forecastAvailable', value === '' ? null : value === 'yes');
  };

  const onRouteChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    updateAnswer('routeType', value === '' ? null : (value as RouteTypeValue));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const snapshot = { ...answers };
    const guidanceIds = matches.map((match) => match.rule.id);

    updateTrip(trip.id, (current) => ({
      ...current,
      readiness: snapshot,
      safetyPlan: {
        generatedAt: new Date().toISOString(),
        answers: snapshot,
        guidanceIds,
        trustedContactName: current.safetyPlan?.trustedContactName ?? '',
        trustedContactPhone: current.safetyPlan?.trustedContactPhone ?? '',
        meetingPoint: current.safetyPlan?.meetingPoint ?? '',
        notes: current.safetyPlan?.notes ?? '',
      },
    }));
    setSaved(true);
  };

  return (
    <div className="stack">
      <PageHeader
        title={t('safety.title')}
        lead={t('safety.subtitle')}
        actions={
          <ButtonLink to={`/trips/${trip.id}`} variant="secondary">
            {t('safety.backToTrip')}
          </ButtonLink>
        }
      />

      <div className="alert alert--info">{t('safety.disclaimer')}</div>

      <Card title={t('safety.form.title')}>
        <form className="stack" onSubmit={onSubmit}>
          <div className="grid grid--two">
            <InputField
              id="guidance-duration"
              label={t('safety.duration')}
              hint={t('safety.durationHint')}
              type="number"
              min={0}
              step={0.5}
              inputMode="decimal"
              value={answers.durationHours ?? ''}
              onChange={onDurationChange}
              error={durationInvalid ? t('safety.durationInvalid') : undefined}
            />

            <SelectField
              id="guidance-experience"
              label={t('safety.experience')}
              value={answers.groupExperience ?? ''}
              onChange={onExperienceChange}
            >
              <option value="">{t('safety.notSpecified')}</option>
              <option value="first-time">{t('safety.experience.first')}</option>
              <option value="some">{t('safety.experience.some')}</option>
              <option value="experienced">{t('safety.experience.experienced')}</option>
            </SelectField>

            <SelectField
              id="guidance-connectivity"
              label={t('safety.connectivity')}
              value={answers.connectivity ?? ''}
              onChange={onConnectivityChange}
            >
              <option value="">{t('safety.notSpecified')}</option>
              <option value="none">{t('safety.connectivity.none')}</option>
              <option value="unreliable">{t('safety.connectivity.unreliable')}</option>
              <option value="good">{t('safety.connectivity.good')}</option>
            </SelectField>

            <SelectField
              id="guidance-forecast"
              label={t('safety.forecast')}
              value={answers.forecastAvailable === null ? '' : answers.forecastAvailable ? 'yes' : 'no'}
              onChange={onForecastChange}
            >
              <option value="">{t('safety.notSpecified')}</option>
              <option value="yes">{t('safety.forecast.yes')}</option>
              <option value="no">{t('safety.forecast.no')}</option>
            </SelectField>

            <SelectField
              id="guidance-route"
              label={t('safety.route')}
              value={answers.routeType ?? ''}
              onChange={onRouteChange}
            >
              <option value="">{t('safety.notSpecified')}</option>
              <option value="marked">{t('safety.route.marked')}</option>
              <option value="unmarked">{t('safety.route.unmarked')}</option>
              <option value="unknown">{t('safety.route.unknown')}</option>
            </SelectField>
          </div>

          <p className="small muted">
            {t('safety.completeness', {
              provided: completeness.provided,
              total: completeness.total,
            })}
          </p>
          <p className="small muted">{td(GUIDANCE_CATALOG.sourceNote)}</p>

          <div className="cluster">
            <Button type="submit">{t('safety.generate')}</Button>
            {saved ? (
              <span className="small" role="status">
                {t('safety.saved')}
              </span>
            ) : null}
          </div>
        </form>
      </Card>

      {completeness.missing.length > 0 ? (
        <div className="alert alert--warning">
          <p>
            <strong>{t('safety.missingInputs')}</strong>
          </p>
          <p>{t('safety.missingInputs.detail', { fields: missingLabels })}</p>
        </div>
      ) : null}

      <section className="stack" aria-labelledby="guidance-recommendations">
        <h2 id="guidance-recommendations">{t('safety.recommendations')}</h2>

        {matches.length === 0 ? (
          <div className="alert alert--info">{t('safety.noRecommendations')}</div>
        ) : (
          matches.map((match) => {
            const rule = match.rule;
            return (
              <article className="card" key={rule.id}>
                <div className="cluster">
                  <Badge tone={severityTone(match.severity)}>{t(`safety.severity.${match.severity}`)}</Badge>
                  <Badge tone={match.classification === 'official' ? 'accent' : 'neutral'}>
                    {t(`safety.classification.${match.classification}`)}
                  </Badge>
                  <Badge tone={rule.source.reviewStatus === 'human-reviewed' ? 'success' : 'warning'}>
                    {t(reviewStatusKey(rule.source.reviewStatus))}
                  </Badge>
                </div>

                <h3>{td(rule.title)}</h3>
                <p>{td(rule.explanation)}</p>

                <div>
                  <p className="small">
                    <strong>{t('safety.why')}</strong>
                  </p>
                  <ul>
                    {match.reasons.map((reason, index) => (
                      <li className="small" key={`${rule.id}-reason-${index}`}>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="small muted">{td(rule.source.note)}</p>

                <p className="small">
                  {t('safety.source')}: {rule.source.publisher} · {t('safety.lastVerified')}:{' '}
                  {rule.source.lastVerified} ·{' '}
                  <a href={rule.source.url} target="_blank" rel="noreferrer">
                    {t('safety.source.open')}
                  </a>
                </p>
                <p className="small muted">
                  {t('safety.reviewStatus')}: {t(reviewStatusKey(rule.source.reviewStatus))} ·{' '}
                  {t('safety.translationStatus')}: {t(`safety.translationStatus.${rule.translationStatus}`)}
                </p>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
