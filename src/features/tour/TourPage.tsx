import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnlineStatus } from '../../app/useOnlineStatus';
import { getBrowserStorage, removeKey, STORAGE_KEYS } from '../../data/storage';
import {
  checklistProgress,
  durationHours,
  formatDateTime,
  fromLocalInputValue,
  toLocalInputValue,
  validateTripInput,
} from '../../domain/trip';
import {
  SUPPORTED_LANGUAGES,
  type Language,
  type ReviewStatus,
  type Trip,
  type TripValidationIssue,
} from '../../domain/types';
import { useI18n } from '../../i18n';
import { translate } from '../../i18n/translate';
import {
  ArrowLeftIcon,
  Badge,
  Button,
  ButtonLink,
  Card,
  CompassIcon,
  CopyIcon,
  DownloadIcon,
  FeatureStatus,
  InputField,
  PageHeader,
  TextAreaField,
  type BadgeTone,
} from '../../ui';
import { downloadIcsFile, generateIcs, sanitizeIcsFilename } from '../calendar/ics';
import { sourceHost, telHref } from '../emergency/coordinates';
import { EMERGENCY_CONTACTS, PHRASEBOOK, PHRASEBOOK_CATEGORIES, PRIMARY_CONTACT_ID } from '../emergency/data';
import { evaluateGuidance, type GuidanceSeverity } from '../safety-rules/engine';
import { copyText } from '../sharing/shareActions';
import { TOUR_TOTAL, buildTourMessage, clampStep, stepIdAt } from './tourData';
import { createTourState, tourReducer, type TourTripPatch } from './tourState';
import './tour.css';

const PROBLEM_SCENARIOS = ['connectivity', 'sharing', 'response'] as const;
const AUDIENCES = ['solo', 'group', 'coordinator'] as const;
const OFFLINE_TABS = ['works', 'needs'] as const;

const FUTURE_ITEMS: ReadonlyArray<{ id: string; state: 'demo' | 'planned' | 'requires-integration' }> = [
  { id: 'weather', state: 'demo' },
  { id: 'coordination', state: 'planned' },
  { id: 'satellite', state: 'requires-integration' },
  { id: 'integrations', state: 'requires-integration' },
];

const ROADMAP_ITEMS = [1, 2, 3] as const;

const REVIEW_TONE: Record<ReviewStatus, BadgeTone> = {
  unreviewed: 'neutral',
  'machine-translated': 'accent',
  'human-review-required': 'warning',
  'human-reviewed': 'success',
};

const SEVERITY_TONE: Record<GuidanceSeverity, BadgeTone> = {
  info: 'info',
  caution: 'warning',
  critical: 'danger',
};

const SCOPE_LABEL_KEY = {
  national: 'emergency:emergency.scope.national',
  'almaty-city': 'emergency:emergency.scope.almaty',
} as const;

function useIssueText() {
  const { t } = useI18n();
  return (issue: TripValidationIssue): string => {
    if (issue.code === 'required') {
      if (issue.field === 'name') return t('trips:trips.validation.nameRequired');
      if (issue.field === 'destination') return t('trips:trips.validation.destinationRequired');
      return '';
    }
    if (issue.code === 'invalid') {
      if (issue.field === 'departureAt') return t('trips:trips.validation.departureInvalid');
      if (issue.field === 'returnAt') return t('trips:trips.validation.returnInvalid');
      return '';
    }
    if (issue.code === 'return-before-departure') return t('trips:trips.validation.returnBeforeDeparture');
    if (issue.code === 'departure-in-past') return t('trips:trips.validation.departureInPast');
    if (issue.code === 'group-size-range') return t('trips:trips.validation.groupSize');
    return '';
  };
}

function ProblemStep() {
  const { t } = useI18n();
  const [scenario, setScenario] = useState<(typeof PROBLEM_SCENARIOS)[number]>('connectivity');

  return (
    <Card title={t('tour:tour.steps.problem.scenariosTitle')}>
      <div className="cluster" role="group" aria-label={t('tour:tour.steps.problem.scenariosTitle')}>
        {PROBLEM_SCENARIOS.map((id) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={scenario === id ? 'primary' : 'secondary'}
            aria-pressed={scenario === id}
            onClick={() => setScenario(id)}
          >
            {t(`tour:tour.steps.problem.scenario.${id}.label`)}
          </Button>
        ))}
      </div>
      <ul style={{ marginTop: 'var(--space-3)', paddingLeft: '1.1rem' }}>
        <li>{t(`tour:tour.steps.problem.scenario.${scenario}.item1`)}</li>
        <li>{t(`tour:tour.steps.problem.scenario.${scenario}.item2`)}</li>
      </ul>
    </Card>
  );
}

function PurposeStep() {
  const { t } = useI18n();
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>('solo');

  return (
    <Card title={t('tour:tour.steps.purpose.audienceTitle')}>
      <div className="cluster" role="group" aria-label={t('tour:tour.steps.purpose.audienceTitle')}>
        {AUDIENCES.map((id) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={audience === id ? 'primary' : 'secondary'}
            aria-pressed={audience === id}
            onClick={() => setAudience(id)}
          >
            {t(`tour:tour.steps.purpose.audience.${id}.label`)}
          </Button>
        ))}
      </div>
      <ul style={{ marginTop: 'var(--space-3)', paddingLeft: '1.1rem' }}>
        <li>{t(`tour:tour.steps.purpose.audience.${audience}.item1`)}</li>
        <li>{t(`tour:tour.steps.purpose.audience.${audience}.item2`)}</li>
      </ul>
    </Card>
  );
}

function LanguageStep() {
  const { t, language } = useI18n();
  const [previewLanguage, setPreviewLanguage] = useState<Language>(language);

  const previewItems: Array<{ label: string; value: string }> = [
    {
      label: translate(previewLanguage, 'trips:trips.form.name'),
      value: translate(previewLanguage, 'trips:trips.form.namePlaceholder'),
    },
    {
      label: translate(previewLanguage, 'trips:trips.form.destination'),
      value: translate(previewLanguage, 'trips:trips.form.destinationPlaceholder'),
    },
    {
      label: translate(previewLanguage, 'trips:trips.form.notes'),
      value: translate(previewLanguage, 'trips:trips.form.notesPlaceholder'),
    },
  ];

  return (
    <div className="stack">
      <Card title={t('tour:tour.steps.language.previewTitle')}>
        <div className="cluster" role="group" aria-label={t('language.label')}>
          {SUPPORTED_LANGUAGES.map((code) => (
            <Button
              key={code}
              type="button"
              size="sm"
              variant={previewLanguage === code ? 'primary' : 'secondary'}
              aria-pressed={previewLanguage === code}
              onClick={() => setPreviewLanguage(code)}
            >
              {translate(code, `language.${code}Native`)}
            </Button>
          ))}
        </div>
        <dl className="definition-list">
          {previewItems.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="cluster">
          <Badge tone="info">{translate(previewLanguage, 'nav.tour')}</Badge>
          <Badge tone="success">{translate(previewLanguage, 'action.save')}</Badge>
          <Badge tone="neutral">{translate(previewLanguage, `language.${previewLanguage}`)}</Badge>
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>
          {t('tour:tour.steps.language.previewNote')}
        </p>
      </Card>

      <Card title={t('language.label')}>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li>{t('tour:tour.steps.language.item1')}</li>
          <li>{t('tour:tour.steps.language.item2')}</li>
          <li>{t('tour:tour.steps.language.item3')}</li>
          <li>{t('tour:tour.steps.language.item4')}</li>
        </ul>
        <div className="cluster" style={{ marginTop: 'var(--space-3)' }}>
          <ButtonLink to="/settings" variant="secondary">
            {t('tour:tour.steps.language.settingsLink')}
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}

function TripStep({
  trip,
  sampleNow,
  onPatch,
}: {
  trip: Trip;
  sampleNow: number;
  onPatch: (patch: TourTripPatch) => void;
}) {
  const { t, language } = useI18n();
  const issueText = useIssueText();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const issues = useMemo(
    () =>
      validateTripInput(
        {
          name: trip.name,
          destination: trip.destination,
          departureAt: trip.departureAt,
          returnAt: trip.returnAt,
          groupSize: trip.groupSize,
          notes: trip.notes,
        },
        new Date(sampleNow),
      ),
    [trip, sampleNow],
  );

  const touch = (field: string) => setTouched((current) => (current[field] ? current : { ...current, [field]: true }));

  const errorFor = (field: TripValidationIssue['field']): string | undefined => {
    if (!touched[field]) return undefined;
    const parts = issues
      .filter((issue) => issue.field === field)
      .map(issueText)
      .filter((part) => part.length > 0);
    return parts.length > 0 ? parts.join(' ') : undefined;
  };

  const duration = durationHours(trip);

  return (
    <div className="stack">
      <Card>
        <div className="grid grid--two">
          <InputField
            id="tour-trip-name"
            label={t('trips:trips.form.name')}
            required
            value={trip.name}
            error={errorFor('name')}
            onBlur={() => touch('name')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onPatch({ name: event.target.value })}
          />
          <InputField
            id="tour-trip-destination"
            label={t('trips:trips.form.destination')}
            required
            value={trip.destination}
            error={errorFor('destination')}
            onBlur={() => touch('destination')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onPatch({ destination: event.target.value })}
          />
          <InputField
            id="tour-trip-departure"
            type="datetime-local"
            label={t('trips:trips.form.departure')}
            required
            value={toLocalInputValue(trip.departureAt)}
            error={errorFor('departureAt')}
            onBlur={() => touch('departureAt')}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onPatch({ departureAt: fromLocalInputValue(event.target.value) })
            }
          />
          <InputField
            id="tour-trip-return"
            type="datetime-local"
            label={t('trips:trips.form.return')}
            required
            value={toLocalInputValue(trip.returnAt)}
            error={errorFor('returnAt')}
            onBlur={() => touch('returnAt')}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onPatch({ returnAt: fromLocalInputValue(event.target.value) })
            }
          />
          <InputField
            id="tour-trip-group-size"
            type="number"
            min={1}
            max={50}
            label={t('trips:trips.form.groupSize')}
            required
            value={String(trip.groupSize)}
            error={errorFor('groupSize')}
            onBlur={() => touch('groupSize')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onPatch({ groupSize: Number(event.target.value) })}
          />
          <TextAreaField
            id="tour-trip-notes"
            label={t('trips:trips.form.notes')}
            value={trip.notes}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onPatch({ notes: event.target.value })}
          />
        </div>
      </Card>

      <Card title={t('tour:tour.steps.trip.previewTitle')}>
        <p className="small muted" style={{ marginTop: 0 }}>
          {t('tour:tour.steps.trip.hint')}
        </p>
        <div className="cluster" style={{ marginBottom: 'var(--space-2)' }}>
          <Badge tone="accent">{t('tour:tour.sampleBadge')}</Badge>
          {issues.length === 0 ? (
            <Badge tone="success">{t('state.saved')}</Badge>
          ) : (
            <Badge tone="warning">{t('trips:trips.form.errorSummary')}</Badge>
          )}
        </div>
        <dl className="definition-list">
          <div>
            <dt>{t('trips:trips.detail.departure')}</dt>
            <dd>{formatDateTime(trip.departureAt, language)}</dd>
          </div>
          <div>
            <dt>{t('trips:trips.detail.return')}</dt>
            <dd>{formatDateTime(trip.returnAt, language)}</dd>
          </div>
          <div>
            <dt>{t('trips:trips.detail.group')}</dt>
            <dd>{trip.groupSize}</dd>
          </div>
          <div>
            <dt>{t('trips:trips.detail.duration')}</dt>
            <dd>{duration === null ? '—' : `${duration} ${t('trips:trips.detail.hours')}`}</dd>
          </div>
        </dl>
        {issues.length > 0 ? (
          <div className="alert alert--warning" role="status">
            <strong>{t('trips:trips.form.errorSummary')}</strong>
            <ul style={{ margin: '4px 0 0', paddingLeft: '1.1rem' }}>
              {issues.map((issue, index) => (
                <li key={`${issue.field}-${issue.code}-${index}`}>{issueText(issue) || t('error.generic')}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function ChecklistStep({ trip, onToggle }: { trip: Trip; onToggle: (id: string) => void }) {
  const { t, td, language } = useI18n();
  const progress = checklistProgress(trip.checklist);
  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);
  const matches = useMemo(() => evaluateGuidance(trip.readiness, { language }), [trip.readiness, language]);
  const plan = trip.safetyPlan;

  return (
    <div className="stack">
      <Card>
        <div className="meter-row">
          <span>{t('checklist:checklist.progressValue', { done: progress.done, total: progress.total })}</span>
          <span>{percent}%</span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.done}
          aria-label={t('checklist:checklist.progress')}
        >
          <div className="progress__bar" style={{ width: `${percent}%` }} />
        </div>
        <p className="small" style={{ marginBottom: 0 }}>
          {t('checklist:checklist.requiredRemaining', { count: progress.requiredRemaining })}
        </p>
      </Card>

      <Card title={t('checklist:checklist.title')}>
        <ul className="list-reset stack stack--tight">
          {trip.checklist.map((item) => (
            <li key={item.id} className="cluster" style={{ justifyContent: 'space-between' }}>
              <span className="cluster">
                <input
                  type="checkbox"
                  id={`tour-checklist-${item.id}`}
                  checked={item.done}
                  onChange={() => onToggle(item.id)}
                  style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <label htmlFor={`tour-checklist-${item.id}`} style={{ cursor: 'pointer' }}>
                  {td(item.label)}
                </label>
              </span>
              <Badge tone={item.required ? 'accent' : 'neutral'}>
                {item.required ? t('checklist:checklist.required') : t('checklist:checklist.optional')}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card title={t('tour:tour.steps.checklist.planTitle')}>
        <p className="card__body">{t('tour:tour.steps.checklist.planBody')}</p>
        {matches.length === 0 ? (
          <p className="small muted">{t('tour:tour.steps.checklist.noGuidance')}</p>
        ) : (
          <ul className="list-reset stack stack--tight">
            {matches.slice(0, 3).map((match) => (
              <li key={match.rule.id} className="card card--flat">
                <div className="cluster" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>{td(match.rule.title)}</h3>
                  <Badge tone={SEVERITY_TONE[match.severity]}>
                    {t(`safety:safety.severity.${match.severity}`)}
                  </Badge>
                </div>
                <p className="small" style={{ marginBottom: 0 }}>
                  {td(match.rule.explanation)}
                </p>
              </li>
            ))}
          </ul>
        )}
        {plan ? (
          <dl className="definition-list">
            <div>
              <dt>{t('sharing:sharing.contactName')}</dt>
              <dd>{plan.trustedContactName}</dd>
            </div>
            <div>
              <dt>{t('sharing:sharing.contactPhone')}</dt>
              <dd>{plan.trustedContactPhone}</dd>
            </div>
            <div>
              <dt>{t('sharing:sharing.meetingPoint')}</dt>
              <dd>{plan.meetingPoint}</dd>
            </div>
          </dl>
        ) : null}
      </Card>
    </div>
  );
}

function ShareStep({ trip, language, sampleNow }: { trip: Trip; language: Language; sampleNow: number }) {
  const { t } = useI18n();
  const message = useMemo(() => buildTourMessage(trip, language, new Date(sampleNow)), [trip, language, sampleNow]);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle');

  const handleCopy = async () => {
    const result = await copyText(message.body);
    setCopyStatus(result === 'copied' ? 'copied' : 'manual');
  };

  return (
    <Card title={t('sharing:sharing.preview')}>
      <pre className="tour-preview" data-testid="tour-message-preview">
        {message.body}
      </pre>
      <div className="cluster" style={{ marginTop: 'var(--space-3)' }}>
        <Button type="button" variant="secondary" icon={<CopyIcon />} onClick={() => void handleCopy()}>
          {t('sharing:sharing.copy')}
        </Button>
        <Badge tone="info">{t('sharing:sharing.deliveredNever')}</Badge>
      </div>
      <p className="small muted" style={{ marginBottom: 0 }}>
        {t('sharing:sharing.generatedVsSent')}
      </p>
      {copyStatus !== 'idle' ? (
        <p className="small" role="status" style={{ marginBottom: 0 }}>
          {copyStatus === 'copied' ? t('sharing:sharing.copied') : t('sharing:sharing.copyManual')}
        </p>
      ) : null}
    </Card>
  );
}

function ReminderStep({ trip, sampleNow }: { trip: Trip; sampleNow: number }) {
  const { t, language } = useI18n();
  const [status, setStatus] = useState<'idle' | 'ready' | 'error'>('idle');

  const ics = useMemo(() => {
    try {
      return generateIcs(trip, { now: new Date(sampleNow) });
    } catch {
      return null;
    }
  }, [trip, sampleNow]);

  const handleDownload = () => {
    if (!ics) {
      setStatus('error');
      return;
    }
    downloadIcsFile(sanitizeIcsFilename(trip.name), ics);
    setStatus('ready');
  };

  return (
    <div className="stack">
      <Card title={t('trips:trips.detail.reminder')}>
        <dl className="definition-list">
          <div>
            <dt>{t('trips:trips.detail.departure')}</dt>
            <dd>{formatDateTime(trip.departureAt, language)}</dd>
          </div>
          <div>
            <dt>{t('trips:trips.detail.return')}</dt>
            <dd>{formatDateTime(trip.returnAt, language)}</dd>
          </div>
        </dl>
        <p className="small">{t('sharing:sharing.calendar.alarms')}</p>
        <div className="cluster">
          <Button type="button" icon={<DownloadIcon />} disabled={!ics} onClick={handleDownload}>
            {t('sharing:sharing.calendar.download')}
          </Button>
          <span className="tiny muted">.ics · UTF-8</span>
        </div>
        {status === 'ready' ? (
          <p className="small" role="status" style={{ marginBottom: 0 }}>
            {t('tour:tour.reminder.ready')}
          </p>
        ) : null}
        {status === 'error' ? (
          <p className="small" role="alert" style={{ marginBottom: 0 }}>
            {t('error.generic')}
          </p>
        ) : null}
        <details className="tour-details">
          <summary>{t('tour:tour.reminder.previewToggle')}</summary>
          <pre className="tour-preview">{ics ?? ''}</pre>
        </details>
      </Card>
      <div className="alert alert--warning" role="note">
        {t('sharing:sharing.calendar.limits')}
      </div>
    </div>
  );
}

function EmergencyStep() {
  const { t, td } = useI18n();

  return (
    <div className="stack">
      <Card title={t('emergency:emergency.numbers')}>
        <p className="small muted" style={{ marginTop: 0 }}>
          {t('emergency:emergency.sourcesNote')}
        </p>
        <ul className="list-reset stack stack--tight">
          {EMERGENCY_CONTACTS.map((contact) => {
            const isPrimary = contact.id === PRIMARY_CONTACT_ID;
            const label = td(contact.label);
            return (
              <li key={contact.id}>
                <article className={isPrimary ? 'card card--accent' : 'card'} aria-labelledby={`tour-${contact.id}-label`}>
                  <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 16rem' }}>
                      <h3 id={`tour-${contact.id}-label`} style={{ marginBottom: 4 }}>
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
                      aria-label={`${t('emergency:emergency.call')} ${contact.number} — ${label}`}
                    >
                      {t('emergency:emergency.call')} {contact.number}
                    </a>
                  </div>
                  <div className="cluster" style={{ rowGap: 6 }}>
                    <Badge tone={REVIEW_TONE[contact.reviewStatus]}>
                      {t(`emergency:emergency.review.${contact.reviewStatus}`)}
                    </Badge>
                    <Badge tone={contact.scope === 'national' ? 'info' : 'neutral'}>
                      {t(SCOPE_LABEL_KEY[contact.scope])}
                    </Badge>
                    <span className="tiny muted">
                      {t('emergency:emergency.source')}:{' '}
                      <a href={contact.sourceUrl} target="_blank" rel="noreferrer noopener">
                        {sourceHost(contact.sourceUrl)}
                      </a>
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        <p className="small muted" style={{ marginBottom: 0 }}>
          {t('emergency:emergency.callHint')}
        </p>
      </Card>

      <Card title={t('emergency:emergency.phrasebook.title')}>
        <p className="card__body">{t('emergency:emergency.phrasebook.body')}</p>
        <p className="small muted">{t('emergency:emergency.phrasebook.reviewNote')}</p>
        {PHRASEBOOK_CATEGORIES.map((category) => (
          <section key={category} aria-labelledby={`tour-phrasebook-${category}`}>
            <h3 id={`tour-phrasebook-${category}`} style={{ marginBottom: 8 }}>
              {t(`emergency:emergency.phrasebook.category.${category}`)}
            </h3>
            <ul className="list-reset stack stack--tight">
              {PHRASEBOOK.filter((entry) => entry.category === category).map((entry) => (
                <li key={entry.id} className="card card--flat">
                  <div className="cluster" style={{ justifyContent: 'space-between' }}>
                    <Badge tone={REVIEW_TONE[entry.reviewStatus]}>
                      {t(`emergency:emergency.review.${entry.reviewStatus}`)}
                    </Badge>
                  </div>
                  <p className="small" lang="kk" style={{ margin: '8px 0 2px' }}>
                    <span className="muted">{t('emergency:emergency.phrasebook.language.kk')}: </span>
                    {entry.kk}
                  </p>
                  <p className="small" lang="ru" style={{ margin: '2px 0' }}>
                    <span className="muted">{t('emergency:emergency.phrasebook.language.ru')}: </span>
                    {entry.ru}
                  </p>
                  <p className="small" lang="en" style={{ margin: '2px 0 0' }}>
                    <span className="muted">{t('emergency:emergency.phrasebook.language.en')}: </span>
                    {entry.en}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Card>

      <div className="alert alert--info" role="note">
        {t('tour:tour.steps.emergency.geoNote')}
      </div>

      <div className="cluster">
        <ButtonLink to="/emergency" variant="secondary">
          {t('tour:tour.steps.emergency.openFull')}
        </ButtonLink>
      </div>
    </div>
  );
}

function OfflineStep() {
  const { t } = useI18n();
  const online = useOnlineStatus();
  const [tab, setTab] = useState<(typeof OFFLINE_TABS)[number]>('works');

  return (
    <Card title={t('tour:tour.steps.offline.statusLabel')}>
      <div className="cluster" style={{ marginBottom: 'var(--space-3)' }}>
        <Badge tone={online ? 'success' : 'warning'}>{online ? t('state.online') : t('state.offline')}</Badge>
        <span className="small muted">{t('tour:tour.steps.offline.body')}</span>
      </div>
      <div className="cluster" role="group" aria-label={t('tour:tour.steps.offline.statusLabel')}>
        {OFFLINE_TABS.map((id) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={tab === id ? 'primary' : 'secondary'}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {t(`tour:tour.steps.offline.tab.${id}`)}
          </Button>
        ))}
      </div>
      <ul style={{ marginTop: 'var(--space-3)', paddingLeft: '1.1rem' }}>
        <li>{t(`tour:tour.steps.offline.${tab}.item1`)}</li>
        <li>{t(`tour:tour.steps.offline.${tab}.item2`)}</li>
        <li>{t(`tour:tour.steps.offline.${tab}.item3`)}</li>
      </ul>
    </Card>
  );
}

function FutureStep() {
  const { t } = useI18n();

  return (
    <div className="stack">
      <ul className="list-reset stack stack--tight">
        {FUTURE_ITEMS.map((item) => (
          <li key={item.id} className="card">
            <div className="cluster" style={{ justifyContent: 'space-between' }}>
              <strong>{t(`tour:tour.steps.future.item.${item.id}.title`)}</strong>
              <FeatureStatus state={item.state} />
            </div>
            <p className="card__body small" style={{ marginBottom: 0 }}>
              {t(`tour:tour.steps.future.item.${item.id}.body`)}
            </p>
          </li>
        ))}
      </ul>
      <div className="cluster">
        <ButtonLink to="/future" variant="secondary">
          {t('tour:tour.steps.future.link')}
        </ButtonLink>
      </div>
    </div>
  );
}

function RoadmapStep() {
  const { t } = useI18n();

  return (
    <div className="stack">
      <Card title={t('tour:tour.steps.roadmap.phasesTitle')}>
        <ol className="list-reset stack stack--tight">
          {ROADMAP_ITEMS.map((index) => (
            <li key={index} className="card card--flat">
              <strong>{t(`tour:tour.steps.roadmap.item.${index}.title`)}</strong>
              <p className="card__body small" style={{ marginBottom: 0 }}>
                {t(`tour:tour.steps.roadmap.item.${index}.body`)}
              </p>
            </li>
          ))}
        </ol>
      </Card>
      <Card title={t('tour:tour.steps.roadmap.impactTitle')}>
        <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
          <li>{t('tour:tour.steps.roadmap.impact1')}</li>
          <li>{t('tour:tour.steps.roadmap.impact2')}</li>
        </ul>
        <div className="cluster" style={{ marginTop: 'var(--space-3)' }}>
          <ButtonLink to="/future" icon={<CompassIcon />}>
            {t('tour:tour.steps.roadmap.link')}
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}

function stepContent(
  stepId: string,
  trip: Trip,
  sampleNow: number,
  language: Language,
  onPatch: (patch: TourTripPatch) => void,
  onToggle: (id: string) => void,
): ReactNode {
  switch (stepId) {
    case 'problem':
      return <ProblemStep />;
    case 'purpose':
      return <PurposeStep />;
    case 'language':
      return <LanguageStep />;
    case 'trip':
      return <TripStep trip={trip} sampleNow={sampleNow} onPatch={onPatch} />;
    case 'checklist':
      return <ChecklistStep trip={trip} onToggle={onToggle} />;
    case 'share':
      return <ShareStep trip={trip} language={language} sampleNow={sampleNow} />;
    case 'reminder':
      return <ReminderStep trip={trip} sampleNow={sampleNow} />;
    case 'emergency':
      return <EmergencyStep />;
    case 'offline':
      return <OfflineStep />;
    case 'future':
      return <FutureStep />;
    case 'roadmap':
      return <RoadmapStep />;
    default:
      return <ProblemStep />;
  }
}

const HEADING_ID = 'tour-step-heading';

export function TourPage() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(tourReducer, language, createTourState);
  const [showResetStatus, setShowResetStatus] = useState(false);
  const didFocus = useRef(false);

  const stepIndex = clampStep(state.currentStep);
  const stepId = stepIdAt(stepIndex);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_TOTAL - 1;

  useEffect(() => {
    if (!didFocus.current) {
      didFocus.current = true;
      return;
    }
    const heading = document.getElementById(HEADING_ID);
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.classList.add('tour-step-heading');
    heading.focus();
  }, [stepIndex]);

  const handleNext = () => {
    setShowResetStatus(false);
    dispatch({ type: 'next' });
  };

  const handleBack = () => {
    setShowResetStatus(false);
    dispatch({ type: 'back' });
  };

  const handleExit = () => {
    navigate('/');
  };

  const handleReset = () => {
    dispatch({ type: 'reset' });
    removeKey(getBrowserStorage(), STORAGE_KEYS.demo);
    setShowResetStatus(true);
  };

  return (
    <div className="stack">
      <div className="tour-demo-banner" role="note" aria-label={t('tour:tour.demoMode')}>
        <strong className="tour-demo-banner__title">{t('tour:tour.demoMode')}</strong>
        <p className="tour-demo-banner__text">{t('tour:tour.demoNotice')}</p>
      </div>

      <div className="stack stack--tight">
        <p aria-live="polite" className="small muted" style={{ margin: 0 }}>
          {t('tour:tour.step', { current: stepIndex + 1, total: TOUR_TOTAL })}
        </p>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOUR_TOTAL}
          aria-valuenow={stepIndex + 1}
          aria-label={t('tour:tour.progressLabel')}
        >
          <div className="progress__bar" style={{ width: `${((stepIndex + 1) / TOUR_TOTAL) * 100}%` }} />
        </div>
      </div>

      <PageHeader
        id={HEADING_ID}
        eyebrow={t('tour:tour.title')}
        title={t(`tour:tour.steps.${stepId}.title`)}
        lead={t(`tour:tour.steps.${stepId}.body`)}
      />

      <div className="stack" key={stepId}>
        {stepContent(
          stepId,
          state.sampleTrip,
          state.sampleNow,
          state.language,
          (patch) => dispatch({ type: 'patchTrip', patch }),
          (id) => dispatch({ type: 'toggleChecklist', id }),
        )}
      </div>

      {showResetStatus ? (
        <p className="alert alert--success" role="status">
          {t('tour:tour.resetDone')}
        </p>
      ) : null}

      <Card>
        <div className="cluster" style={{ justifyContent: 'space-between', rowGap: 'var(--space-3)' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={isFirst}
            icon={<ArrowLeftIcon />}
          >
            {t('tour:tour.back')}
          </Button>
          <div className="cluster">
            <Button type="button" variant="ghost" onClick={handleReset}>
              {t('tour:tour.reset')}
            </Button>
            <Button type="button" variant="ghost" onClick={handleExit}>
              {t('tour:tour.exit')}
            </Button>
            <Button type="button" onClick={handleNext} disabled={isLast}>
              {t('tour:tour.next')}
            </Button>
            {isLast ? (
              <Button type="button" variant="primary" onClick={handleExit}>
                {t('tour:tour.finish')}
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
