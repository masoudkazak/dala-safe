import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip, useTrips } from '../../data/TripsProvider';
import { useI18n } from '../../i18n';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  InputField,
  PageHeader,
  SelectField,
} from '../../ui';
import type { GeneratedMessage, Language, Trip } from '../../domain/types';
import { ensureSafetyPlan, withContactDetails } from './contactPlan';
import {
  generateEmailDraft,
  generateTripNotice,
  generateTrustedContactMessage,
  type EmailDraft,
  type TripNoticeSet,
} from './messageGenerator';
import { copyText, downloadText, shareText } from './shareActions';
import './sharing.css';

type StatusTone = 'info' | 'success' | 'warning';

interface StatusMessage {
  key: string;
  tone: StatusTone;
}

export function SharePage() {
  const { tripId } = useParams();
  const trip = useTrip(tripId);
  const { t } = useI18n();

  if (!trip) {
    return (
      <div className="stack">
        <PageHeader
          title={t('trips:trips.notFound.title')}
          lead={t('trips:trips.notFound.body')}
        />
        <ButtonLink to="/trips" variant="secondary">
          {t('trips:trips.notFound.back')}
        </ButtonLink>
      </div>
    );
  }

  return <SharePageContent key={trip.id} trip={trip} />;
}

function buildFileName(trip: Trip, message: GeneratedMessage): string {
  const base = `${trip.name}-${message.kind}-${message.language}`
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `dala-safe-${base || trip.id}.txt`;
}

function SharePageContent({ trip }: { trip: Trip }) {
  const { t, language, availableLanguages } = useI18n();
  const { updateTrip } = useTrips();
  const plan = ensureSafetyPlan(trip);

  const [contactName, setContactName] = useState(plan.trustedContactName);
  const [contactPhone, setContactPhone] = useState(plan.trustedContactPhone);
  const [meetingPoint, setMeetingPoint] = useState(plan.meetingPoint);
  const [messageLanguage, setMessageLanguage] = useState<Language>(language);
  const [trustedMessage, setTrustedMessage] = useState<GeneratedMessage | null>(null);
  const [notice, setNotice] = useState<TripNoticeSet | null>(null);
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  const mergedTrip = withContactDetails(trip, {
    trustedContactName: contactName,
    trustedContactPhone: contactPhone,
    meetingPoint,
  });

  function handleSaveContact() {
    updateTrip(trip.id, (current) => {
      const base = ensureSafetyPlan(current);
      return {
        ...current,
        safetyPlan: {
          ...base,
          trustedContactName: contactName.trim(),
          trustedContactPhone: contactPhone.trim(),
          meetingPoint: meetingPoint.trim(),
        },
      };
    });
    setStatus({ key: 'sharing:sharing.contact.saved', tone: 'success' });
  }

  function handleGenerateTrusted() {
    setTrustedMessage(generateTrustedContactMessage(mergedTrip, { language: messageLanguage }));
    setStatus({ key: 'sharing:sharing.generatedStatus', tone: 'info' });
  }

  function handleGenerateNotice() {
    setNotice(generateTripNotice(mergedTrip, { language: messageLanguage }));
    setStatus({ key: 'sharing:sharing.generatedStatus', tone: 'info' });
  }

  function handleGenerateEmail() {
    setEmailDraft(generateEmailDraft(mergedTrip, { language: messageLanguage }));
    setStatus({ key: 'sharing:sharing.generatedStatus', tone: 'info' });
  }

  function handleReset() {
    setTrustedMessage(null);
    setNotice(null);
    setEmailDraft(null);
    setStatus(null);
  }

  async function handleCopy(message: GeneratedMessage) {
    const result = await copyText(message.body);
    setStatus({
      key: result === 'copied' ? 'sharing:sharing.copied' : 'sharing:sharing.copyManual',
      tone: result === 'copied' ? 'success' : 'warning',
    });
  }

  async function handleShare(message: GeneratedMessage) {
    const result = await shareText({ title: t('sharing:sharing.shareTitle'), text: message.body });
    if (result === 'unsupported') {
      const copy = await copyText(message.body);
      setStatus({
        key: copy === 'copied' ? 'sharing:sharing.shareUnsupportedCopied' : 'sharing:sharing.shareUnsupportedManual',
        tone: 'warning',
      });
      return;
    }
    if (result === 'shared') {
      setStatus({ key: 'sharing:sharing.shareOpened', tone: 'info' });
      return;
    }
    if (result === 'cancelled') {
      setStatus({ key: 'sharing:sharing.shareCancelled', tone: 'info' });
      return;
    }
    setStatus({ key: 'sharing:sharing.shareFailed', tone: 'warning' });
  }

  function handleDownload(message: GeneratedMessage) {
    const ok = downloadText(message.body, buildFileName(trip, message));
    setStatus({ key: ok ? 'sharing:sharing.downloaded' : 'sharing:sharing.downloadFailed', tone: ok ? 'info' : 'warning' });
  }

  const mailtoHref = emailDraft
    ? `mailto:?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`
    : undefined;

  return (
    <div className="stack">
      <PageHeader
        title={t('sharing:sharing.title')}
        lead={t('sharing:sharing.subtitle')}
        actions={
          <>
            <ButtonLink to={`/trips/${trip.id}/reminder`} variant="secondary">
              {t('sharing:sharing.calendarLink')}
            </ButtonLink>
            <ButtonLink to={`/trips/${trip.id}`} variant="ghost">
              {t('action.back')}
            </ButtonLink>
          </>
        }
      />

      <div className="alert alert--warning">
        <p>
          <strong>{t('sharing:sharing.deliveredNever')}</strong>
        </p>
        <p>{t('sharing:sharing.generatedVsSent')}</p>
      </div>

      {status ? (
        <div className={`alert alert--${status.tone}`} role="status" aria-live="polite">
          {t(status.key)}
        </div>
      ) : null}

      <Card title={t('sharing:sharing.trusted.title')}>
        <p className="card__body">{t('sharing:sharing.trusted.body')}</p>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            handleSaveContact();
          }}
        >
          <InputField
            id="sharing-contact-name"
            label={t('sharing:sharing.contactName')}
            placeholder={t('sharing:sharing.contactNamePlaceholder')}
            autoComplete="name"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
          />
          <InputField
            id="sharing-contact-phone"
            label={t('sharing:sharing.contactPhone')}
            placeholder={t('sharing:sharing.contactPhonePlaceholder')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
          />
          <InputField
            id="sharing-meeting-point"
            label={t('sharing:sharing.meetingPoint')}
            placeholder={t('sharing:sharing.meetingPointPlaceholder')}
            value={meetingPoint}
            onChange={(event) => setMeetingPoint(event.target.value)}
            hint={t('sharing:sharing.contactHint')}
          />
          <div className="cluster">
            <Button type="submit" variant="secondary">
              {t('sharing:sharing.contact.save')}
            </Button>
          </div>
        </form>
      </Card>

      <Card title={t('sharing:sharing.generate')}>
        <div className="stack">
          <SelectField
            id="sharing-message-language"
            label={t('sharing:sharing.language')}
            hint={t('sharing:sharing.messageLanguageHint')}
            value={messageLanguage}
            onChange={(event) => setMessageLanguage(event.target.value as Language)}
          >
            {availableLanguages.map((item) => (
              <option key={item} value={item}>
                {t(`language.${item}Native`)}
              </option>
            ))}
          </SelectField>
          <div className="cluster">
            <Button type="button" onClick={handleGenerateTrusted}>
              {t('sharing:sharing.generateTrusted')}
            </Button>
            <Button type="button" variant="secondary" onClick={handleGenerateNotice}>
              {t('sharing:sharing.generateNotice')}
            </Button>
            <Button type="button" variant="secondary" onClick={handleGenerateEmail}>
              {t('sharing:sharing.generateEmail')}
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset}>
              {t('sharing:sharing.reset')}
            </Button>
          </div>
        </div>
      </Card>

      <Card title={t('sharing:sharing.preview')}>
        <div className="stack">
          {!trustedMessage && !notice && !emailDraft ? (
            <p className="muted">{t('sharing:sharing.emptyPreview')}</p>
          ) : null}

          {trustedMessage ? (
            <PreviewPane
              title={t('sharing:sharing.trusted.title')}
              message={trustedMessage}
              onCopy={handleCopy}
              onShare={handleShare}
              onDownload={handleDownload}
            />
          ) : null}

          {notice ? (
            <>
              <PreviewPane
                title={`${t('sharing:sharing.notice.title')} — ${t('language.kkNative')}`}
                message={notice.kk}
                onCopy={handleCopy}
                onShare={handleShare}
                onDownload={handleDownload}
              />
              <PreviewPane
                title={`${t('sharing:sharing.notice.title')} — ${t('language.ruNative')}`}
                message={notice.ru}
                onCopy={handleCopy}
                onShare={handleShare}
                onDownload={handleDownload}
              />
              {notice.translation ? (
                <PreviewPane
                  title={t('sharing:sharing.notice.translation')}
                  message={notice.translation}
                  onCopy={handleCopy}
                  onShare={handleShare}
                  onDownload={handleDownload}
                />
              ) : null}
            </>
          ) : null}

          {emailDraft ? (
            <div className="stack">
              <h3 className="sharing-preview__heading">{t('sharing:sharing.email')}</h3>
              <p className="sharing-subject">{t('sharing:sharing.email.subjectLine', { subject: emailDraft.subject })}</p>
              <PreviewPane
                title={t('sharing:sharing.email.body')}
                message={emailDraft.message}
                onCopy={handleCopy}
                onShare={handleShare}
                onDownload={handleDownload}
              />
              <div className="cluster">
                {mailtoHref ? (
                  <a
                    className="button button--secondary"
                    href={mailtoHref}
                    onClick={() => setStatus({ key: 'sharing:sharing.email.opened', tone: 'info' })}
                  >
                    {t('sharing:sharing.email.open')}
                  </a>
                ) : null}
              </div>
              <p className="small muted">{t('sharing:sharing.email.note')}</p>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function PreviewPane({
  title,
  message,
  onCopy,
  onShare,
  onDownload,
}: {
  title: string;
  message: GeneratedMessage;
  onCopy: (message: GeneratedMessage) => void;
  onShare: (message: GeneratedMessage) => void;
  onDownload: (message: GeneratedMessage) => void;
}) {
  const { t } = useI18n();
  const languageName = t(`language.${message.language}Native`);

  return (
    <section className="stack stack--tight" aria-label={`${title} — ${languageName}`}>
      <div className="sharing-preview__heading-row">
        <h3 className="sharing-preview__heading">{title}</h3>
        <Badge tone="warning">{t('sharing:sharing.deliveredNever')}</Badge>
      </div>
      <pre className="sharing-preview" tabIndex={0} aria-label={`${title} — ${t('sharing:sharing.preview')}`}>
        {message.body}
      </pre>
      <div className="cluster">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onCopy(message)}
          aria-label={`${t('sharing:sharing.copy')} — ${languageName}`}
        >
          {t('sharing:sharing.copy')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onShare(message)}
          aria-label={`${t('sharing:sharing.share')} — ${languageName}`}
        >
          {t('sharing:sharing.share')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onDownload(message)}
          aria-label={`${t('sharing:sharing.download')} — ${languageName}`}
        >
          {t('sharing:sharing.download')}
        </Button>
      </div>
    </section>
  );
}
