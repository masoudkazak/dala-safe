import { useCallback, useState } from 'react';
import { useOnlineStatus } from '../../app/useOnlineStatus';
import type { ReviewStatus } from '../../domain/types';
import { useI18n } from '../../i18n';
import { Badge, Button, Card, PageHeader, type BadgeTone } from '../../ui';
import { CopyIcon, ShareIcon } from '../../ui/Icons';
import {
  EMERGENCY_CONTACTS,
  EMERGENCY_GUIDANCE,
  PHRASEBOOK,
  PHRASEBOOK_CATEGORIES,
  PRIMARY_CONTACT_ID,
} from './data';
import { copyText, formatCoordinates, shareCoordinates, sourceHost, telHref } from './coordinates';
import { useGeolocation } from './useGeolocation';

const REVIEW_LABEL_KEY: Record<ReviewStatus, string> = {
  unreviewed: 'emergency.review.unreviewed',
  'machine-translated': 'emergency.review.machine-translated',
  'human-review-required': 'emergency.review.human-review-required',
  'human-reviewed': 'emergency.review.human-reviewed',
};

const REVIEW_TONE: Record<ReviewStatus, BadgeTone> = {
  unreviewed: 'neutral',
  'machine-translated': 'accent',
  'human-review-required': 'warning',
  'human-reviewed': 'success',
};

const SCOPE_LABEL_KEY = {
  national: 'emergency.scope.national',
  'almaty-city': 'emergency.scope.almaty',
} as const;

function useEmergencyTranslation() {
  const { t } = useI18n();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => t(`emergency:${key}`, vars),
    [t],
  );
}

function ReviewBadge({ status }: { status: ReviewStatus }) {
  const t = useEmergencyTranslation();
  return <Badge tone={REVIEW_TONE[status]}>{t(REVIEW_LABEL_KEY[status])}</Badge>;
}

function SourceLine({ url, lastVerified }: { url: string; lastVerified: string }) {
  const t = useEmergencyTranslation();
  return (
    <span className="tiny muted">
      {t('emergency.source')}:{' '}
      <a href={url} target="_blank" rel="noreferrer noopener">
        {sourceHost(url)}
      </a>{' '}
      · {t('emergency.lastVerified')}: <time dateTime={lastVerified}>{lastVerified}</time>
    </span>
  );
}

export function EmergencyPage({ demo = false }: { demo?: boolean }) {
  const { td } = useI18n();
  const t = useEmergencyTranslation();
  const online = useOnlineStatus();
  const { status, position, isPoorAccuracy, poorAccuracyThreshold, requestLocation } = useGeolocation();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const accuracyMeters = position?.accuracy === null ? null : Math.round(position?.accuracy ?? 0);
  const coordinates = position ? formatCoordinates(position) : '';

  const handleRequest = () => {
    setActionMessage(null);
    requestLocation();
  };

  const handleCopy = async () => {
    if (!position) return;
    const copied = await copyText(coordinates);
    setActionMessage(t(copied ? 'emergency.geo.copied' : 'emergency.geo.copyFailed'));
  };

  const handleShare = async () => {
    if (!position) return;
    const shareText = t('emergency.geo.shareText', {
      coordinates,
      meters: accuracyMeters === null ? t('emergency.geo.accuracyUnknownShort') : accuracyMeters,
    });
    const outcome = await shareCoordinates(shareText, t('emergency.geo.shareTitle'));

    if (outcome === 'cancelled') {
      setActionMessage(null);
      return;
    }

    const key =
      outcome === 'shared'
        ? 'emergency.geo.shared'
        : outcome === 'copied'
          ? 'emergency.geo.shareUnavailable'
          : 'emergency.geo.shareFailed';
    setActionMessage(t(key));
  };

  const requestLabel =
    status === 'prompt' || status === 'unsupported'
      ? t('emergency.geo.request')
      : t('emergency.geo.retry');

  return (
    <div className="stack">
      <PageHeader title={t('emergency.title')} lead={t('emergency.subtitle')} />

      <div className="alert alert--danger" role="note">
        <strong>{t('emergency.primaryTitle')}</strong>
        <p style={{ margin: '4px 0 0' }}>{t('emergency.primaryNote')}</p>
      </div>

      {demo ? (
        <div className="alert alert--info" role="status">
          <strong>{t('emergency.demoTitle')}</strong>
          <p style={{ margin: '4px 0 0' }}>{t('emergency.demoWarning')}</p>
        </div>
      ) : null}

      {!online ? (
        <div className="alert alert--info" role="status">
          <strong>{t('emergency.offlineTitle')}</strong>
          <p style={{ margin: '4px 0 0' }}>{t('emergency.offlineNote')}</p>
        </div>
      ) : null}

      <section className="stack" aria-labelledby="emergency-numbers-title">
        <div>
          <h2 id="emergency-numbers-title" style={{ marginBottom: 4 }}>
            {t('emergency.numbers')}
          </h2>
          <p className="small muted" style={{ margin: 0 }}>
            {t('emergency.sourcesNote')}
          </p>
        </div>

        <ul className="list-reset stack stack--tight">
          {EMERGENCY_CONTACTS.map((contact) => {
            const isPrimary = contact.id === PRIMARY_CONTACT_ID;
            const label = td(contact.label);
            return (
              <li key={contact.id}>
                <article className={isPrimary ? 'card card--accent' : 'card'} aria-labelledby={`${contact.id}-label`}>
                  <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 16rem' }}>
                      <h3 id={`${contact.id}-label`} style={{ marginBottom: 4 }}>
                        {label}
                      </h3>
                      <p className="card__body small">{td(contact.description)}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1 }}
                    >
                      {contact.number}
                    </span>
                  </div>

                  <div className="cluster" style={{ margin: '12px 0 10px' }}>
                    <a
                      className={`button ${isPrimary ? 'button--danger' : 'button--secondary'} button--block`}
                      href={telHref(contact.number)}
                      aria-label={`${t('emergency.call')} ${contact.number} — ${label}`}
                    >
                      {t('emergency.call')} {contact.number}
                    </a>
                  </div>

                  <div className="cluster" style={{ rowGap: 6 }}>
                    <ReviewBadge status={contact.reviewStatus} />
                    <Badge tone={contact.scope === 'national' ? 'info' : 'neutral'}>
                      {t(SCOPE_LABEL_KEY[contact.scope])}
                    </Badge>
                    <SourceLine url={contact.sourceUrl} lastVerified={contact.lastVerified} />
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="small muted" style={{ margin: 0 }}>
          {t('emergency.callHint')}
        </p>
      </section>

      <Card title={t('emergency.geo.title')}>
        <p className="card__body">{t('emergency.geo.privacy')}</p>

        <div className="cluster" style={{ marginTop: '12px' }}>
          <Button
            variant="secondary"
            onClick={handleRequest}
            disabled={status === 'requesting' || status === 'unsupported'}
          >
            {status === 'requesting' ? t('emergency.geo.requesting') : requestLabel}
          </Button>
        </div>

        <div style={{ marginTop: '12px' }} aria-live="polite">
          {status === 'prompt' ? <p className="small muted" style={{ margin: 0 }}>{t('emergency.geo.idle')}</p> : null}

          {status === 'requesting' ? <p className="small muted" style={{ margin: 0 }}>{t('emergency.geo.requesting')}</p> : null}

          {status === 'unsupported' ? <div className="alert alert--warning">{t('emergency.geo.unsupported')}</div> : null}

          {status === 'denied' ? <div className="alert alert--warning">{t('emergency.geo.denied')}</div> : null}

          {status === 'timeout' ? <div className="alert alert--warning">{t('emergency.geo.timeout')}</div> : null}

          {status === 'unavailable' ? <div className="alert alert--warning">{t('emergency.geo.unavailable')}</div> : null}

          {status === 'granted' && position ? (
            <div className="stack stack--tight">
              <dl className="definition-list">
                <div>
                  <dt>{t('emergency.geo.latitude')}</dt>
                  <dd>{position.latitude.toFixed(5)}</dd>
                </div>
                <div>
                  <dt>{t('emergency.geo.longitude')}</dt>
                  <dd>{position.longitude.toFixed(5)}</dd>
                </div>
                <div>
                  <dt>{t('emergency.geo.accuracyLabel')}</dt>
                  <dd>
                    {accuracyMeters === null
                      ? t('emergency.geo.accuracyUnknown')
                      : t('emergency.geo.accuracyValue', { meters: accuracyMeters })}
                  </dd>
                </div>
              </dl>

              <p className="small" style={{ margin: 0, fontFamily: 'ui-monospace, monospace' }}>
                {coordinates}
              </p>

              {isPoorAccuracy && accuracyMeters !== null ? (
                <div className="alert alert--warning" role="status">
                  {t('emergency.geo.lowAccuracy', { meters: accuracyMeters })}
                </div>
              ) : null}

              <p className="small muted" style={{ margin: 0 }}>
                {t('emergency.geo.accuracyThreshold', { meters: poorAccuracyThreshold })}
              </p>
              <p className="small" style={{ margin: 0 }}>
                {t('emergency.geo.limit')}
              </p>
              <p className="small muted" style={{ margin: 0 }}>
                {t('emergency.geo.notDelivered')}
              </p>

              <div className="cluster">
                <Button variant="secondary" icon={<CopyIcon />} onClick={() => void handleCopy()}>
                  {t('emergency.geo.copy')}
                </Button>
                <Button variant="secondary" icon={<ShareIcon />} onClick={() => void handleShare()}>
                  {t('emergency.geo.share')}
                </Button>
              </div>

              {actionMessage ? (
                <p className="small" role="status" style={{ margin: 0 }}>
                  {actionMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>

      <Card title={t('emergency.phrasebook.title')}>
        <p className="card__body">{t('emergency.phrasebook.body')}</p>
        <p className="small muted">{t('emergency.phrasebook.reviewNote')}</p>

        <div className="stack">
          {PHRASEBOOK_CATEGORIES.map((category) => (
            <section key={category} aria-labelledby={`phrasebook-${category}`}>
              <h3 id={`phrasebook-${category}`} style={{ marginBottom: 8 }}>
                {t(`emergency.phrasebook.category.${category}`)}
              </h3>
              <ul className="list-reset stack stack--tight">
                {PHRASEBOOK.filter((entry) => entry.category === category).map((entry) => (
                  <li key={entry.id} className="card card--flat">
                    <div className="cluster" style={{ justifyContent: 'space-between' }}>
                      <ReviewBadge status={entry.reviewStatus} />
                    </div>
                    <p className="small" lang="kk" style={{ margin: '8px 0 2px' }}>
                      <span className="muted">{t('emergency.phrasebook.language.kk')}: </span>
                      {entry.kk}
                    </p>
                    <p className="small" lang="ru" style={{ margin: '2px 0' }}>
                      <span className="muted">{t('emergency.phrasebook.language.ru')}: </span>
                      {entry.ru}
                    </p>
                    <p className="small" lang="en" style={{ margin: '2px 0 0' }}>
                      <span className="muted">{t('emergency.phrasebook.language.en')}: </span>
                      {entry.en}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Card>

      <Card title={t('emergency.guidance.title')}>
        <p className="card__body">{t('emergency.guidance.body')}</p>
        <p className="small muted">{t('emergency.guidance.reviewNote')}</p>

        <ol className="list-reset stack stack--tight">
          {EMERGENCY_GUIDANCE.map((item) => (
            <li key={item.id} className="card card--flat">
              <h3 style={{ marginBottom: 4 }}>{td(item.title)}</h3>
              <p className="small" style={{ marginTop: 0 }}>
                {td(item.body)}
              </p>
              <div className="cluster" style={{ rowGap: 6 }}>
                <ReviewBadge status={item.reviewStatus} />
                <SourceLine url={item.sourceUrl} lastVerified={item.lastVerified} />
              </div>
              <p className="tiny muted" style={{ marginBottom: 0 }}>
                {item.publisher}
              </p>
            </li>
          ))}
        </ol>

        <div className="alert alert--warning" role="note" style={{ marginTop: '12px' }}>
          <strong>{t('emergency.official')}</strong>
          <p style={{ margin: '4px 0 0' }}>{t('emergency.guidance.officialNote')}</p>
        </div>

        <div className="cluster" style={{ marginTop: '12px' }}>
          <a
            className="button button--ghost button--sm"
            href={EMERGENCY_GUIDANCE[0].sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            {t('emergency.guidance.openOfficial')}
          </a>
        </div>

        <p className="small muted" style={{ marginBottom: 0 }}>
          {t('emergency.guidance.offline')}
        </p>
      </Card>
    </div>
  );
}
