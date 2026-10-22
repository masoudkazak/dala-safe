import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTrip, useTrips } from '../../data/TripsProvider';
import { checklistProgress, durationHours, formatDateTime } from '../../domain/trip';
import type { Trip, TripStatus } from '../../domain/types';
import { Badge, Button, ButtonLink, Card, ConfirmDialog, PageHeader, type BadgeTone } from '../../ui';
import { ArrowLeftIcon } from '../../ui/Icons';
import { useTripsI18n } from './i18n';

const STATUS_TONE: Record<TripStatus, BadgeTone> = {
  draft: 'neutral',
  ready: 'info',
  completed: 'success',
};

function readinessSummary(trip: Trip): Array<{ labelKey: string; value: string }> {
  const { readiness } = trip;
  const entries: Array<{ labelKey: string; value: string | null; valueKey?: string }> = [
    { labelKey: 'safety.duration', value: readiness.durationHours === null ? null : `${readiness.durationHours}` },
    {
      labelKey: 'safety.experience',
      value: readiness.groupExperience,
      valueKey: readiness.groupExperience ? `safety.experience.${readiness.groupExperience}` : undefined,
    },
    {
      labelKey: 'safety.connectivity',
      value: readiness.connectivity,
      valueKey: readiness.connectivity ? `safety.connectivity.${readiness.connectivity}` : undefined,
    },
    {
      labelKey: 'safety.forecast',
      value: readiness.forecastAvailable === null ? null : readiness.forecastAvailable ? 'yes' : 'no',
      valueKey:
        readiness.forecastAvailable === null ? undefined : readiness.forecastAvailable ? 'safety.forecast.yes' : 'safety.forecast.no',
    },
    {
      labelKey: 'safety.route',
      value: readiness.routeType,
      valueKey: readiness.routeType ? `safety.route.${readiness.routeType}` : undefined,
    },
  ];
  return entries.map(({ labelKey, value, valueKey }) => ({
    labelKey,
    value: value === null ? '' : valueKey ? valueKey : value,
  }));
}

export function TripDetailPage() {
  const { t, language } = useTripsI18n();
  const { tripId } = useParams();
  const navigate = useNavigate();
  const trip = useTrip(tripId);
  const { duplicateTrip, setStatus, deleteTrip } = useTrips();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!trip) {
    return (
      <div className="stack">
        <PageHeader title={t('trips.notFound.title')} lead={t('trips.notFound.body')} />
        <div>
          <ButtonLink to="/trips" variant="secondary" icon={<ArrowLeftIcon />}>
            {t('trips.notFound.back')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const progress = checklistProgress(trip.checklist);
  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);
  const hours = durationHours(trip);
  const readiness = readinessSummary(trip);
  const readinessAnswered = readiness.some((entry) => entry.value !== '');

  const onDuplicate = () => {
    const copy = duplicateTrip(trip.id);
    if (copy) navigate(`/trips/${copy.id}`);
  };

  const onCompleteToggle = () => {
    setStatus(trip.id, trip.status === 'completed' ? 'draft' : 'completed');
  };

  const onDelete = () => {
    deleteTrip(trip.id);
    navigate('/trips');
  };

  return (
    <div className="stack">
      <PageHeader
        eyebrow={<Badge tone={STATUS_TONE[trip.status]}>{t(`trips.status.${trip.status}`)}</Badge>}
        title={trip.name}
        lead={trip.destination}
        actions={
          <div className="cluster no-print">
            <ButtonLink to={`/trips/${trip.id}/edit`} variant="secondary">
              {t('trips.detail.edit')}
            </ButtonLink>
            <Button type="button" variant="secondary" onClick={onDuplicate}>
              {t('trips.detail.duplicate')}
            </Button>
            <Button type="button" variant={trip.status === 'completed' ? 'secondary' : 'primary'} onClick={onCompleteToggle}>
              {trip.status === 'completed' ? t('trips.detail.reopen') : t('trips.detail.complete')}
            </Button>
            <Button type="button" variant="danger-outline" onClick={() => setConfirmDelete(true)}>
              {t('trips.detail.delete')}
            </Button>
          </div>
        }
      />

      <Card title={t('trips.detail.checklist')}>
        <div className="meter-row">
          <span>{t('trips.list.progress', { done: progress.done, total: progress.total })}</span>
          <span>{percent}%</span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.done}
          aria-label={t('trips.detail.progress')}
        >
          <div className="progress__bar" style={{ width: `${percent}%` }} />
        </div>
        {progress.requiredRemaining > 0 ? (
          <p className="small muted">{t('checklist.requiredRemaining', { count: progress.requiredRemaining })}</p>
        ) : (
          <p className="small" role="status">{t('checklist.allDone')}</p>
        )}
        <div className="cluster no-print">
          <ButtonLink to={`/trips/${trip.id}/checklist`} variant="secondary">
            {t('trips.detail.checklist')}
          </ButtonLink>
        </div>
      </Card>

      <Card title={t('trips.plan.title')}>
        <p>{t('trips.plan.description')}</p>
        <div className="cluster no-print">
          <ButtonLink to={`/trips/${trip.id}/plan`} variant="secondary">
            {t('trips.detail.plan')}
          </ButtonLink>
          <ButtonLink to={`/trips/${trip.id}/guidance`} variant="secondary">
            {t('trips.detail.guidance')}
          </ButtonLink>
          <ButtonLink to={`/trips/${trip.id}/share`} variant="secondary">
            {t('trips.detail.share')}
          </ButtonLink>
          <ButtonLink to={`/trips/${trip.id}/reminder`} variant="secondary">
            {t('trips.detail.reminder')}
          </ButtonLink>
          <ButtonLink to={`/trips/${trip.id}/route`} variant="secondary">
            {t('trips.detail.route')}
          </ButtonLink>
        </div>
      </Card>

      <Card title={t('trips.detail.readiness')}>
        {readinessAnswered ? (
          <dl>
            {readiness.map((entry) => (
              <div key={entry.labelKey}>
                <dt className="small muted">{t(entry.labelKey)}</dt>
                <dd style={{ margin: 0 }}>{entry.value === '' ? t('safety.notSpecified') : entry.value.includes('.') ? t(entry.value) : entry.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="muted">{t('trips.detail.readinessEmpty')}</p>
        )}
        <div className="cluster no-print">
          <ButtonLink to={`/trips/${trip.id}/guidance`} variant="secondary">
            {t('trips.detail.guidance')}
          </ButtonLink>
        </div>
      </Card>

      <Card title={t('trips.plan.section.trip')}>
        <dl>
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
          <div>
            <dt className="small muted">{t('trips.detail.notes')}</dt>
            <dd style={{ margin: 0 }}>{trip.notes.trim() ? trip.notes : t('trips.detail.noNotes')}</dd>
          </div>
        </dl>
      </Card>

      <div className="no-print">
        <Link to="/trips">{t('trips.notFound.back')}</Link>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t('trips.detail.deleteTitle')}
        body={`${trip.name} — ${trip.destination}. ${t('trips.detail.deleteBody')}`}
        confirmLabel={t('trips.detail.delete')}
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
