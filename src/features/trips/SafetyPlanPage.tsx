import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip, useTrips } from '../../data/TripsProvider';
import { checklistProgress, durationHours, formatDateTime } from '../../domain/trip';
import type { ReadinessAnswers } from '../../domain/types';
import { getGuidanceById } from '../safety-rules/catalog';
import { evaluateGuidance } from '../safety-rules/engine';
import { Badge, Button, ButtonLink, Card, EmptyState, PageHeader } from '../../ui';
import { useTripsI18n } from './i18n';

export function SafetyPlanPage() {
  const { t, td, language } = useTripsI18n();
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const { updateTrip } = useTrips();
  const [generated, setGenerated] = useState(false);

  if (!trip) {
    return (
      <div className="stack">
        <PageHeader title={t('trips.notFound.title')} lead={t('trips.notFound.body')} />
        <div>
          <ButtonLink to="/trips" variant="secondary">
            {t('trips.notFound.back')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const plan = trip.safetyPlan;
  const progress = checklistProgress(trip.checklist);
  const hours = durationHours(trip);

  const onGenerate = () => {
    const answers: ReadinessAnswers = { ...trip.readiness };
    if (answers.durationHours === null && hours !== null) answers.durationHours = hours;
    const matches = evaluateGuidance(answers, { language });
    const guidanceIds = matches.map((match) => match.rule.id);
    updateTrip(trip.id, (current) => ({
      ...current,
      readiness: answers,
      safetyPlan: {
        generatedAt: new Date().toISOString(),
        answers,
        guidanceIds,
        trustedContactName: current.safetyPlan?.trustedContactName ?? '',
        trustedContactPhone: current.safetyPlan?.trustedContactPhone ?? '',
        meetingPoint: current.safetyPlan?.meetingPoint ?? '',
        notes: current.safetyPlan?.notes ?? '',
      },
    }));
    setGenerated(true);
  };

  const readinessRows: Array<{ labelKey: string; valueKey: string | null }> = [
    {
      labelKey: 'safety.experience',
      valueKey: plan?.answers.groupExperience ? `safety.experience.${plan.answers.groupExperience}` : null,
    },
    {
      labelKey: 'safety.connectivity',
      valueKey: plan?.answers.connectivity ? `safety.connectivity.${plan.answers.connectivity}` : null,
    },
    {
      labelKey: 'safety.forecast',
      valueKey:
        plan?.answers.forecastAvailable === null || plan?.answers.forecastAvailable === undefined
          ? null
          : plan.answers.forecastAvailable
            ? 'safety.forecast.yes'
            : 'safety.forecast.no',
    },
    {
      labelKey: 'safety.route',
      valueKey: plan?.answers.routeType ? `safety.route.${plan.answers.routeType}` : null,
    },
  ];

  return (
    <div className="stack">
      <PageHeader
        title={t('trips.plan.title')}
        lead={t('trips.plan.description')}
        actions={
          <div className="cluster no-print">
            <ButtonLink to={`/trips/${trip.id}`} variant="secondary">
              {t('safety.backToTrip')}
            </ButtonLink>
            <Button type="button" variant="primary" onClick={() => window.print()}>
              {t('action.print')}
            </Button>
          </div>
        }
      />

      <div className="alert alert--warning no-print">
        <p>
          <strong>{t('trips.plan.description')}</strong>
        </p>
        <p>{t('trips.plan.noGuarantee')}</p>
      </div>

      {!plan ? (
        <EmptyState
          title={t('trips.plan.title')}
          body={t('trips.plan.empty')}
          action={
            <div className="cluster no-print">
              <Button type="button" onClick={onGenerate}>
                {t('trips.plan.generate')}
              </Button>
              <ButtonLink to={`/trips/${trip.id}/guidance`} variant="secondary">
                {t('trips.detail.guidance')}
              </ButtonLink>
            </div>
          }
        />
      ) : (
        <>
          <p className="small muted no-print">{t('trips.plan.printHint')}</p>
          {generated ? (
            <p className="small" role="status">
              {t('trips.plan.generated')}
            </p>
          ) : null}

          <Card title={t('trips.plan.section.trip')}>
            <dl>
              <div>
                <dt className="small muted">{t('trips.form.name')}</dt>
                <dd style={{ margin: 0 }}>{trip.name}</dd>
              </div>
              <div>
                <dt className="small muted">{t('trips.form.destination')}</dt>
                <dd style={{ margin: 0 }}>{trip.destination}</dd>
              </div>
              <div>
                <dt className="small muted">{t('trips.detail.departure')}</dt>
                <dd style={{ margin: 0 }}>{formatDateTime(trip.departureAt, language)}</dd>
              </div>
              <div>
                <dt className="small muted">{t('trips.detail.return')}</dt>
                <dd style={{ margin: 0 }}>{formatDateTime(trip.returnAt, language)}</dd>
              </div>
              <div>
                <dt className="small muted">{t('trips.detail.duration')}</dt>
                <dd style={{ margin: 0 }}>{hours === null ? '—' : `${hours} ${t('trips.detail.hours')}`}</dd>
              </div>
              <div>
                <dt className="small muted">{t('trips.detail.group')}</dt>
                <dd style={{ margin: 0 }}>{trip.groupSize}</dd>
              </div>
              {trip.notes.trim() ? (
                <div>
                  <dt className="small muted">{t('trips.detail.notes')}</dt>
                  <dd style={{ margin: 0 }}>{trip.notes}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card title={t('trips.plan.section.checklist')}>
            <p>
              {t('trips.plan.checklistSummary', {
                done: progress.done,
                total: progress.total,
                requiredRemaining: progress.requiredRemaining,
              })}
            </p>
            <ul className="list-reset stack stack--tight">
              {trip.checklist.map((item) => (
                <li key={item.id} className="cluster">
                  <span aria-hidden="true">{item.done ? '✓' : '○'}</span>
                  <span>{td(item.label)}</span>
                  <span className="visually-hidden">
                    {item.done ? t('checklist.progress') : t('trips.plan.itemOpen')}
                  </span>
                  <Badge tone={item.required ? 'accent' : 'neutral'}>
                    {item.required ? t('checklist.required') : t('checklist.optional')}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card title={t('trips.plan.section.readiness')}>
            <p className="small muted">{t('trips.plan.generatedAt', { time: formatDateTime(plan.generatedAt, language) })}</p>
            <dl>
              <div>
                <dt className="small muted">{t('safety.duration')}</dt>
                <dd style={{ margin: 0 }}>
                  {plan.answers.durationHours === null ? t('safety.notSpecified') : `${plan.answers.durationHours} ${t('trips.detail.hours')}`}
                </dd>
              </div>
              {readinessRows.map((entry) => (
                <div key={entry.labelKey}>
                  <dt className="small muted">{t(entry.labelKey)}</dt>
                  <dd style={{ margin: 0 }}>{entry.valueKey ? t(entry.valueKey) : t('safety.notSpecified')}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title={t('trips.plan.section.guidance')}>
            {plan.guidanceIds.length === 0 ? (
              <p className="muted">{t('trips.plan.guidanceEmpty')}</p>
            ) : (
              <ul className="list-reset stack stack--tight">
                {plan.guidanceIds.map((id) => {
                  const rule = getGuidanceById(id);
                  return (
                    <li key={id}>
                      <strong>{rule ? td(rule.title) : id}</strong>
                      {rule ? (
                        <>
                          <div className="cluster">
                            <Badge tone={rule.severity === 'critical' ? 'danger' : rule.severity === 'caution' ? 'warning' : 'info'}>
                              {t(`safety.severity.${rule.severity}`)}
                            </Badge>
                            <Badge tone={rule.classification === 'official' ? 'accent' : 'neutral'}>
                              {t(`safety.classification.${rule.classification}`)}
                            </Badge>
                          </div>
                          <p className="small">{td(rule.explanation)}</p>
                          <p className="small muted">
                            {t('safety.source')}: {rule.source.publisher} · {t('safety.lastVerified')}: {rule.source.lastVerified}
                          </p>
                        </>
                      ) : (
                        <p className="small muted">{t('trips.plan.guidanceMissing')}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="cluster no-print">
              <Button type="button" variant="secondary" onClick={onGenerate}>
                {t('trips.plan.generate')}
              </Button>
            </div>
          </Card>

          <Card title={t('trips.plan.section.contact')}>
            <dl>
              <div>
                <dt className="small muted">{t('trips.plan.trustedContact')}</dt>
                <dd style={{ margin: 0 }}>{plan.trustedContactName.trim() || '—'}</dd>
              </div>
              <div>
                <dt className="small muted">{t('trips.plan.trustedContactPhone')}</dt>
                <dd style={{ margin: 0 }}>{plan.trustedContactPhone.trim() || '—'}</dd>
              </div>
              <div>
                <dt className="small muted">{t('trips.plan.meetingPoint')}</dt>
                <dd style={{ margin: 0 }}>{plan.meetingPoint.trim() || '—'}</dd>
              </div>
              <div>
                <dt className="small muted">{t('trips.plan.notes')}</dt>
                <dd style={{ margin: 0 }}>{plan.notes.trim() || '—'}</dd>
              </div>
            </dl>
          </Card>

          <p className="small muted">{t('trips.plan.noGuarantee')}</p>
        </>
      )}
    </div>
  );
}
