import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrips } from '../../data/TripsProvider';
import { checklistProgress, formatDateTime } from '../../domain/trip';
import type { Trip, TripStatus } from '../../domain/types';
import { Badge, Button, ButtonLink, ConfirmDialog, EmptyState, PageHeader, type BadgeTone } from '../../ui';
import { PlusIcon } from '../../ui/Icons';
import { groupTrips, type TripGroup } from './tripGroups';
import { useTripsI18n } from './i18n';

type Filter = 'all' | TripGroup;

const STATUS_TONE: Record<TripStatus, BadgeTone> = {
  draft: 'neutral',
  ready: 'info',
  completed: 'success',
};

const FILTERS: Filter[] = ['all', 'upcoming', 'active', 'completed'];

const STORAGE_PROBLEM_KEY = {
  quota: 'error.storageQuota',
  unavailable: 'error.storageUnavailable',
  corrupted: 'error.storageCorrupted',
} as const;

export function TripsPage() {
  const { t, language } = useTripsI18n();
  const { trips, duplicateTrip, deleteTrip, storageProblem } = useTrips();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);

  const now = new Date();
  const groups = groupTrips(trips, now);
  const counts: Record<Filter, number> = {
    all: trips.length,
    upcoming: groups.upcoming.length,
    active: groups.active.length,
    completed: groups.completed.length,
  };
  const visible = filter === 'all' ? trips : groups[filter];

  const onDuplicate = (trip: Trip) => {
    const copy = duplicateTrip(trip.id);
    if (copy) navigate(`/trips/${copy.id}`);
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteTrip(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="stack">
      <PageHeader
        title={t('trips.title')}
        lead={`${t('trips.subtitle')} ${t('trips.count', { count: trips.length })}`}
        actions={
          <ButtonLink to="/trips/new" icon={<PlusIcon />}>
            {t('trips.new')}
          </ButtonLink>
        }
      />

      {storageProblem ? (
        <div className="alert alert--warning" role="alert">
          {t(STORAGE_PROBLEM_KEY[storageProblem])}
        </div>
      ) : null}

      {trips.length === 0 ? (
        <EmptyState
          title={t('trips.empty.title')}
          body={t('trips.empty.body')}
          action={<ButtonLink to="/trips/new">{t('trips.new')}</ButtonLink>}
        />
      ) : (
        <>
          <div className="cluster" role="group" aria-label={t('trips.title')}>
            {FILTERS.map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={filter === value ? 'primary' : 'secondary'}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {t(`trips.filter.${value}`)} ({counts[value]})
              </Button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState title={t('trips.group.empty.title')} body={t('trips.group.empty.body')} />
          ) : (
            <ul className="list-reset stack stack--tight">
              {visible.map((trip) => {
                const progress = checklistProgress(trip.checklist);
                const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);
                return (
                  <li key={trip.id} className="card">
                    <div className="cluster">
                      <h2 className="card__title" style={{ margin: 0 }}>
                        <Link to={`/trips/${trip.id}`} style={{ color: 'inherit' }}>
                          {trip.name}
                        </Link>
                      </h2>
                      <Badge tone={STATUS_TONE[trip.status]}>{t(`trips.status.${trip.status}`)}</Badge>
                    </div>
                    <p className="small muted" style={{ margin: 0 }}>
                      {trip.destination}
                    </p>
                    <p className="small" style={{ margin: 0 }}>
                      {t('trips.detail.departure')}: {formatDateTime(trip.departureAt, language)} ·{' '}
                      {t('trips.detail.return')}: {formatDateTime(trip.returnAt, language)}
                    </p>
                    <div>
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
                    </div>
                    <div className="cluster no-print">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => onDuplicate(trip)}
                      >
                        {t('trips.detail.duplicate')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger-outline"
                        onClick={() => setDeleteTarget(trip)}
                      >
                        {t('trips.detail.delete')}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('trips.detail.deleteTitle')}
        body={deleteTarget ? `${deleteTarget.name} — ${deleteTarget.destination}. ${t('trips.detail.deleteBody')}` : t('trips.detail.deleteBody')}
        confirmLabel={t('trips.detail.delete')}
        onConfirm={onConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
