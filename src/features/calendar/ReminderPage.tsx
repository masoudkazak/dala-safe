import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../../data/TripsProvider';
import { formatDateTime, durationHours } from '../../domain/trip';
import { useI18n } from '../../i18n';
import {
  ArrowLeftIcon,
  Badge,
  Button,
  ButtonLink,
  Card,
  DownloadIcon,
  ErrorState,
  PageHeader,
} from '../../ui';
import {
  DEFAULT_DEPARTURE_ALARM_MINUTES,
  DEFAULT_RETURN_ALARM_MINUTES,
  downloadIcsFile,
  generateIcs,
  parseTripDateTime,
  sanitizeIcsFilename,
  validateIcs,
  type IcsValidationResult,
} from './ics';

function validationMessageKey(validation: IcsValidationResult): string {
  const issue = validation.errors[0];
  if (!issue) return 'error.generic';
  if (issue.code === 'invalid-departure') return 'trips.validation.departureInvalid';
  if (issue.code === 'invalid-return') return 'trips.validation.returnInvalid';
  if (issue.code === 'return-not-after-departure') return 'trips.validation.returnBeforeDeparture';
  return 'error.generic';
}

function alarmAmount(minutes: number): number {
  return minutes % 60 === 0 ? minutes / 60 : Math.round((minutes / 60) * 10) / 10;
}

export function ReminderPage() {
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const { t, language } = useI18n();
  const [downloadError, setDownloadError] = useState(false);
  const validation = useMemo(() => (trip ? validateIcs(trip) : null), [trip]);

  if (!trip) {
    return (
      <div className="stack">
        <PageHeader title={t('trips.notFound.title')} lead={t('trips.notFound.body')} />
        <div className="cluster">
          <ButtonLink to="/trips" variant="secondary" icon={<ArrowLeftIcon />}>
            {t('trips.notFound.back')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const backToTrip = (
    <ButtonLink to={`/trips/${trip.id}`} variant="secondary" icon={<ArrowLeftIcon />}>
      {t('action.back')}
    </ButtonLink>
  );

  if (!validation || !validation.valid) {
    return (
      <div className="stack">
        <PageHeader title={t('sharing.calendar.title')} lead={t('sharing.calendar.body')} />
        <ErrorState
          title={t('state.error')}
          body={t(validation ? validationMessageKey(validation) : 'error.generic')}
        />
        <div className="cluster">{backToTrip}</div>
      </div>
    );
  }

  const duration = durationHours(trip);
  const departure = parseTripDateTime(trip.departureAt);
  const returnDate = parseTripDateTime(trip.returnAt);
  const departureAlarm = departure
    ? new Date(departure.getTime() - DEFAULT_DEPARTURE_ALARM_MINUTES * 60_000)
    : null;
  const returnAlarm = returnDate
    ? new Date(returnDate.getTime() - DEFAULT_RETURN_ALARM_MINUTES * 60_000)
    : null;

  const handleDownload = () => {
    setDownloadError(false);
    try {
      downloadIcsFile(sanitizeIcsFilename(trip.name), generateIcs(trip));
    } catch {
      setDownloadError(true);
    }
  };

  return (
    <div className="stack">
      <PageHeader
        title={t('sharing.calendar.title')}
        lead={t('sharing.calendar.body')}
        actions={backToTrip}
      />

      <div className="grid grid--two">
        <Card title={trip.name}>
          <p className="small muted">{trip.destination}</p>
          <dl className="definition-list">
            <div>
              <dt>{t('trips.detail.departure')}</dt>
              <dd>{formatDateTime(trip.departureAt, language)}</dd>
            </div>
            <div>
              <dt>{t('trips.detail.return')}</dt>
              <dd>{formatDateTime(trip.returnAt, language)}</dd>
            </div>
            <div>
              <dt>{t('trips.detail.duration')}</dt>
              <dd>
                {duration === null ? '—' : `${duration} ${t('trips.detail.hours')}`}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title={t('trips.detail.reminder')}>
          <p className="small muted">{t('sharing.calendar.alarms')}</p>
          <ul className="list-reset stack stack--tight">
            <li className="cluster">
              <strong>{t('trips.detail.departure')}</strong>
              <Badge tone="info">
                −{alarmAmount(DEFAULT_DEPARTURE_ALARM_MINUTES)} {t('trips.detail.hours')}
              </Badge>
              <span>
                {departureAlarm
                  ? formatDateTime(departureAlarm.toISOString(), language)
                  : '—'}
              </span>
            </li>
            <li className="cluster">
              <strong>{t('trips.detail.return')}</strong>
              <Badge tone="info">
                −{alarmAmount(DEFAULT_RETURN_ALARM_MINUTES)} {t('trips.detail.hours')}
              </Badge>
              <span>
                {returnAlarm ? formatDateTime(returnAlarm.toISOString(), language) : '—'}
              </span>
            </li>
          </ul>
        </Card>
      </div>

      <Card>
        <div className="cluster" style={{ justifyContent: 'space-between' }}>
          <Button onClick={handleDownload} icon={<DownloadIcon />}>
            {t('sharing.calendar.download')}
          </Button>
          <span className="tiny muted">.ics · UTF-8</span>
        </div>
      </Card>

      <div className="alert alert--warning" role="note">
        {t('sharing.calendar.limits')}
      </div>

      {downloadError ? <ErrorState body={t('error.generic')} /> : null}
    </div>
  );
}
