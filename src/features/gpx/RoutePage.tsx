import { useId, useRef, useState, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import type { TrackSource } from '../../domain/types';
import { useTrip, useTrips } from '../../data/TripsProvider';
import { useI18n } from '../../i18n';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  DownloadIcon,
  EmptyState,
  PageHeader,
} from '../../ui';
import { exportGpx } from './exportGpx';
import { GPX_ERROR_KEYS, MAX_GPX_BYTES, parseGpx } from './parseGpx';
import { RouteMap } from './RouteMap';

type FeedbackTone = 'success' | 'danger' | 'warning' | 'info';

interface Feedback {
  tone: FeedbackTone;
  key: string;
}

const SOURCE_TONES: Record<TrackSource, 'success' | 'info' | 'warning' | 'accent'> = {
  recorded: 'success',
  imported: 'info',
  estimated: 'warning',
  verified: 'accent',
};

function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('READ_FAILED'));
    reader.readAsText(file);
  });
}

export function RoutePage() {
  const { t: translateKey, language } = useI18n();
  const t = (key: string, vars?: Record<string, string | number>) => translateKey(`gpx:${key}`, vars);
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const { updateTrip } = useTrips();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  if (!trip) {
    return (
      <div className="stack">
        <EmptyState
          title={t('gpx.notFound.title')}
          body={t('gpx.notFound.body')}
          action={<ButtonLink to="/trips">{t('gpx.notFound.back')}</ButtonLink>}
        />
      </div>
    );
  }

  const track = trip.track;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (file.size > MAX_GPX_BYTES) {
      setFeedback({ tone: 'danger', key: GPX_ERROR_KEYS['too-large'] });
      return;
    }

    setFeedback(null);
    setBusy(true);
    try {
      const text = await readFileAsText(file);
      const result = parseGpx(text);
      if (!result.ok) {
        setFeedback({ tone: 'danger', key: GPX_ERROR_KEYS[result.code] });
        return;
      }
      const nextTrack = result.track;
      updateTrip(trip.id, (current) => ({ ...current, track: nextTrack }));
      setFeedback({ tone: 'success', key: 'gpx.imported' });
    } catch {
      setFeedback({ tone: 'danger', key: 'gpx.error.readFailed' });
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    if (!track) return;
    try {
      const { xml, filename } = exportGpx(track);
      const blob = new Blob([xml], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFeedback({ tone: 'success', key: 'gpx.exported' });
    } catch {
      setFeedback({ tone: 'danger', key: 'gpx.error.exportFailed' });
    }
  };

  const handleRemove = () => {
    updateTrip(trip.id, (current) => ({ ...current, track: null }));
    setConfirmingRemove(false);
    setFeedback({ tone: 'success', key: 'gpx.removed' });
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };

  const numberFormat = new Intl.NumberFormat(language, { maximumFractionDigits: 2 });
  const distanceKm = track?.summary.distanceMeters == null ? null : track.summary.distanceMeters / 1000;
  const ascentMeters = track?.summary.ascentMeters ?? null;

  return (
    <div className="stack">
      <PageHeader
        eyebrow={
          <ButtonLink to={`/trips/${trip.id}`} variant="ghost" size="sm">
            {t('gpx.backToTrip')}
          </ButtonLink>
        }
        title={t('gpx.title')}
        lead={t('gpx.subtitle')}
        actions={
          <div className="route-actions">
            <input
              id={fileInputId}
              ref={fileInputRef}
              className="visually-hidden"
              type="file"
              accept=".gpx,application/gpx+xml,application/xml,text/xml"
              tabIndex={-1}
              aria-label={t('gpx.import')}
              onChange={handleFileChange}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={busy}>
              {busy ? t('gpx.importing') : t('gpx.import')}
            </Button>
            {track ? (
              <Button variant="secondary" icon={<DownloadIcon />} onClick={handleExport}>
                {t('gpx.export')}
              </Button>
            ) : null}
          </div>
        }
      />

      {feedback ? (
        <div
          className={`alert alert--${feedback.tone}`}
          role={feedback.tone === 'danger' ? 'alert' : 'status'}
        >
          {t(feedback.key)}
        </div>
      ) : null}

      {!track ? (
        <EmptyState
          title={t('gpx.emptyTitle')}
          body={
            <>
              {t('gpx.empty')}
              <br />
              <span className="small muted">{t('gpx.importHint')}</span>
            </>
          }
        />
      ) : (
        <>
          <div className="grid grid--two">
            <Card title={t('gpx.summary.title')}>
              <dl className="definition-list">
                <div>
                  <dt>{t('gpx.summary.distance')}</dt>
                  <dd>
                    {distanceKm === null
                      ? t('gpx.summary.unavailable')
                      : `${numberFormat.format(distanceKm)} ${t('gpx.unit.km')}`}
                  </dd>
                </div>
                {ascentMeters !== null ? (
                  <div>
                    <dt>{t('gpx.summary.ascent')}</dt>
                    <dd>{`${numberFormat.format(Math.round(ascentMeters))} ${t('gpx.unit.m')}`}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>{t('gpx.summary.points')}</dt>
                  <dd>{numberFormat.format(track.summary.pointCount)}</dd>
                </div>
              </dl>
            </Card>

            <Card title={t('gpx.trackDetails')}>
              <p className="card__body">
                <strong>{track.name || t('gpx.untitled')}</strong>
              </p>
              <div className="cluster" style={{ marginTop: 'var(--space-2)' }}>
                <Badge tone={SOURCE_TONES[track.source]}>{t(`gpx.source.${track.source}`)}</Badge>
                <span className="small muted">
                  {t('gpx.summary.importedAt', { date: formatDate(track.importedAt) })}
                </span>
              </div>
              <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>
                {t('gpx.exportHint')}
              </p>
              <div className="route-actions" style={{ marginTop: 'var(--space-3)' }}>
                <Button variant="danger-outline" onClick={() => setConfirmingRemove(true)}>
                  {t('gpx.remove')}
                </Button>
              </div>
            </Card>
          </div>

          {track.warnings.length > 0 ? (
            <div className="alert alert--warning" role="status">
              <p>
                <strong>{t('gpx.warnings.title')}</strong>
              </p>
              <ul className="list-reset stack stack--tight">
                {Array.from(new Set(track.warnings)).map((warning) => (
                  <li key={warning}>{t(warning)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <Card title={t('gpx.map.heading')}>
            <RouteMap track={track} />
            <p className="small muted" style={{ marginTop: 'var(--space-2)', marginBottom: 0 }}>
              {t('gpx.map.noBasemap')}
            </p>
          </Card>

          <Card flat>
            <p className="small muted" style={{ marginBottom: 0 }}>
              {t('gpx.disclaimer')}
            </p>
          </Card>

          <ConfirmDialog
            open={confirmingRemove}
            title={t('gpx.removeTitle')}
            body={t('gpx.removeBody')}
            confirmLabel={t('gpx.remove')}
            onConfirm={handleRemove}
            onCancel={() => setConfirmingRemove(false)}
          />
        </>
      )}
    </div>
  );
}
