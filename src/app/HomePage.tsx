import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useTrips } from '../data/TripsProvider';
import { formatDateTime, checklistProgress } from '../domain/trip';
import { ButtonLink, Card, EmptyState, PageHeader } from '../ui';
import { PlusIcon } from '../ui/Icons';

export function HomePage() {
  const { t, language } = useI18n();
  const { trips } = useTrips();
  const recent = [...trips]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  return (
    <div className="stack">
      <PageHeader
        eyebrow={t('app.name')}
        title={t('home.title')}
        lead={t('home.lead')}
        actions={
          <>
            <ButtonLink to="/trips/new" icon={<PlusIcon />}>
              {t('home.cta.create')}
            </ButtonLink>
            <ButtonLink to="/emergency" variant="secondary">
              {t('home.cta.emergency')}
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid--three">
        <Card title={t('home.card.prepare.title')}>
          <p className="card__body">{t('home.card.prepare.body')}</p>
        </Card>
        <Card title={t('home.card.share.title')}>
          <p className="card__body">{t('home.card.share.body')}</p>
        </Card>
        <Card title={t('home.card.offline.title')}>
          <p className="card__body">{t('home.card.offline.body')}</p>
        </Card>
      </div>

      <section className="stack" aria-labelledby="recent-trips">
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <h2 id="recent-trips" style={{ margin: 0 }}>
            {t('home.recent.title')}
          </h2>
          <ButtonLink to="/trips" variant="ghost" size="sm">
            {t('home.cta.trips')}
          </ButtonLink>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title={t('trips.empty.title')}
            body={t('home.recent.empty')}
            action={
              <ButtonLink to="/trips/new" icon={<PlusIcon />}>
                {t('home.cta.create')}
              </ButtonLink>
            }
          />
        ) : (
          <ul className="list-reset stack stack--tight">
            {recent.map((trip) => {
              const progress = checklistProgress(trip.checklist);
              return (
                <li key={trip.id}>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="card card--flat"
                    style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="cluster" style={{ justifyContent: 'space-between' }}>
                      <strong>{trip.name}</strong>
                      <span className="badge badge--neutral">
                        {t(`trips.status.${trip.status}`)}
                      </span>
                    </div>
                    <p className="small muted" style={{ margin: '4px 0' }}>
                      {trip.destination} · {formatDateTime(trip.departureAt, language)}
                    </p>
                    <p className="tiny muted" style={{ margin: 0 }}>
                      {t('trips.detail.progress')}: {progress.done}/{progress.total}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Card accent>
        <h2 className="card__title">{t('home.limits.title')}</h2>
        <p className="card__body">{t('home.limits.body')}</p>
        <div className="cluster" style={{ marginTop: '1rem' }}>
          <ButtonLink to="/tour" variant="secondary" size="sm">
            {t('nav.tour')}
          </ButtonLink>
          <ButtonLink to="/future" variant="ghost" size="sm">
            {t('nav.future')}
          </ButtonLink>
        </div>
      </Card>

      <p className="tiny muted">
        <Link to="/settings">{t('nav.settings')}</Link> · <Link to="/emergency">{t('nav.emergency')}</Link>
      </p>
    </div>
  );
}
