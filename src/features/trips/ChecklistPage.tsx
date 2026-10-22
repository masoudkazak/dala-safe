import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip, useTrips } from '../../data/TripsProvider';
import { checklistProgress } from '../../domain/trip';
import type { ChecklistItem } from '../../domain/types';
import { Badge, Button, ButtonLink, Card, ConfirmDialog, InputField, PageHeader } from '../../ui';
import { addCustomItem, removeItem, resetProgress, toggleItem } from './checklistHelpers';
import { useTripsI18n } from './i18n';

export function ChecklistPage() {
  const { t, td } = useTripsI18n();
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const { updateTrip } = useTrips();
  const [newItem, setNewItem] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [status, setStatus] = useState<'added' | 'removed' | 'reset' | null>(null);

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

  const progress = checklistProgress(trip.checklist);
  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);

  const applyItems = (items: ChecklistItem[], message: 'added' | 'removed' | 'reset') => {
    updateTrip(trip.id, (current) => ({ ...current, checklist: items }));
    setStatus(message);
  };

  const onToggle = (id: string) => {
    updateTrip(trip.id, (current) => ({ ...current, checklist: toggleItem(current.checklist, id) }));
    setStatus(null);
  };

  const onAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newItem.trim();
    if (!trimmed) return;
    applyItems(addCustomItem(trip.checklist, trimmed), 'added');
    setNewItem('');
  };

  const onRemove = (id: string) => {
    applyItems(removeItem(trip.checklist, id), 'removed');
  };

  const onReset = () => {
    applyItems(resetProgress(trip.checklist), 'reset');
    setConfirmReset(false);
  };

  return (
    <div className="stack">
      <PageHeader
        title={t('checklist.title')}
        lead={t('checklist.subtitle')}
        actions={
          <ButtonLink to={`/trips/${trip.id}`} variant="secondary">
            {t('safety.backToTrip')}
          </ButtonLink>
        }
      />

      <Card>
        <div className="meter-row">
          <span>{t('checklist.progressValue', { done: progress.done, total: progress.total })}</span>
          <span>{percent}%</span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.done}
          aria-label={t('checklist.progress')}
        >
          <div className="progress__bar" style={{ width: `${percent}%` }} />
        </div>
        <p className="small">
          {t('checklist.requiredRemaining', { count: progress.requiredRemaining })}
        </p>
        {progress.requiredRemaining === 0 && progress.total > 0 ? (
          <div className="alert alert--success" role="status">
            {t('checklist.allDone')}
          </div>
        ) : null}
      </Card>

      {status ? (
        <p className="alert alert--success" role="status">
          {t(`checklist.${status === 'reset' ? 'resetDone' : status === 'added' ? 'added' : 'removed'}`)}
        </p>
      ) : null}

      <Card title={t('checklist.title')}>
        {trip.checklist.length === 0 ? (
          <p className="muted">{t('checklist.empty')}</p>
        ) : (
          <ul className="list-reset stack stack--tight">
            {trip.checklist.map((item) => {
              const label = td(item.label);
              return (
                <li key={item.id} className="cluster" style={{ justifyContent: 'space-between' }}>
                  <span className="cluster">
                    <input
                      type="checkbox"
                      id={`checklist-${item.id}`}
                      checked={item.done}
                      onChange={() => onToggle(item.id)}
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <label htmlFor={`checklist-${item.id}`} style={{ cursor: 'pointer' }}>
                      {label}
                    </label>
                  </span>
                  <span className="cluster">
                    <Badge tone={item.required ? 'accent' : 'neutral'}>
                      {item.required ? t('checklist.required') : t('checklist.optional')}
                    </Badge>
                    {item.custom ? (
                      <>
                        <Badge tone="info">{t('checklist.custom')}</Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger-outline"
                          onClick={() => onRemove(item.id)}
                          aria-label={`${t('checklist.remove')}: ${label}`}
                        >
                          {t('checklist.remove')}
                        </Button>
                      </>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title={t('checklist.add')}>
        <form className="cluster" onSubmit={onAdd}>
          <InputField
            id="checklist-new-item"
            label={t('checklist.addLabel')}
            placeholder={t('checklist.addPlaceholder')}
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            style={{ flex: '1 1 240px' }}
          />
          <Button type="submit">{t('checklist.add')}</Button>
        </form>
      </Card>

      <div className="cluster no-print">
        <Button type="button" variant="secondary" onClick={() => setConfirmReset(true)}>
          {t('checklist.reset')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title={t('checklist.resetTitle')}
        body={t('checklist.resetBody')}
        confirmLabel={t('checklist.reset')}
        onConfirm={onReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
