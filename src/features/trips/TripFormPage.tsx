import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrip, useTrips } from '../../data/TripsProvider';
import { fromLocalInputValue, toLocalInputValue, validateTripInput } from '../../domain/trip';
import type { TripInput, TripValidationIssue } from '../../domain/types';
import { Button, ButtonLink, Card, InputField, PageHeader, TextAreaField } from '../../ui';
import { useTripsI18n } from './i18n';

interface FormState {
  name: string;
  destination: string;
  departureLocal: string;
  returnLocal: string;
  groupSize: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  destination: '',
  departureLocal: '',
  returnLocal: '',
  groupSize: '1',
  notes: '',
};

function formFromTrip(trip: { name: string; destination: string; departureAt: string; returnAt: string; groupSize: number; notes: string } | undefined): FormState {
  if (!trip) return EMPTY_FORM;
  return {
    name: trip.name,
    destination: trip.destination,
    departureLocal: toLocalInputValue(trip.departureAt),
    returnLocal: toLocalInputValue(trip.returnAt),
    groupSize: String(trip.groupSize),
    notes: trip.notes,
  };
}

const ISSUE_KEY: Record<TripValidationIssue['code'], string> = {
  required: '',
  invalid: '',
  'return-before-departure': 'trips.validation.returnBeforeDeparture',
  'departure-in-past': 'trips.validation.departureInPast',
  'group-size-range': 'trips.validation.groupSize',
};

const REQUIRED_KEY: Record<string, string> = {
  name: 'trips.validation.nameRequired',
  destination: 'trips.validation.destinationRequired',
};

const INVALID_KEY: Record<string, string> = {
  departureAt: 'trips.validation.departureInvalid',
  returnAt: 'trips.validation.returnInvalid',
};

type FieldErrors = Partial<Record<'name' | 'destination' | 'departureAt' | 'returnAt' | 'groupSize' | 'notes', string>>;

function issuesToErrors(issues: TripValidationIssue[], t: (key: string) => string): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    let message = '';
    if (issue.code === 'required' && REQUIRED_KEY[issue.field]) message = t(REQUIRED_KEY[issue.field]);
    else if (issue.code === 'invalid' && INVALID_KEY[issue.field]) message = t(INVALID_KEY[issue.field]);
    else if (ISSUE_KEY[issue.code]) message = t(ISSUE_KEY[issue.code]);
    if (!message) continue;
    errors[issue.field] = errors[issue.field] ? `${errors[issue.field]} ${message}` : message;
  }
  return errors;
}

export function TripFormPage() {
  const { t } = useTripsI18n();
  const { tripId } = useParams();
  const navigate = useNavigate();
  const trip = useTrip(tripId);
  const { createTrip, updateTrip } = useTrips();
  const isEdit = Boolean(tripId);

  const [form, setForm] = useState<FormState>(() => formFromTrip(trip));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [activeTripId, setActiveTripId] = useState(trip?.id ?? tripId ?? '');

  if ((trip?.id ?? tripId ?? '') !== activeTripId) {
    setActiveTripId(trip?.id ?? tripId ?? '');
    setForm(formFromTrip(trip));
    setErrors({});
  }

  if (isEdit && !trip) {
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

  const setField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as keyof FieldErrors]) return current;
      const next = { ...current };
      delete next[key as keyof FieldErrors];
      return next;
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const groupSizeRaw = form.groupSize.trim();
    const input: TripInput = {
      name: form.name,
      destination: form.destination,
      departureAt: fromLocalInputValue(form.departureLocal),
      returnAt: fromLocalInputValue(form.returnLocal),
      groupSize: groupSizeRaw === '' ? Number.NaN : Number(groupSizeRaw),
      notes: form.notes,
    };
    const issues = validateTripInput(input);
    if (issues.length > 0) {
      setErrors(issuesToErrors(issues, t));
      return;
    }
    if (isEdit && trip) {
      updateTrip(trip.id, (current) => ({
        ...current,
        name: input.name.trim(),
        destination: input.destination.trim(),
        departureAt: input.departureAt,
        returnAt: input.returnAt,
        groupSize: input.groupSize,
        notes: input.notes?.trim() ?? '',
      }));
      navigate(`/trips/${trip.id}`);
      return;
    }
    const created = createTrip(input);
    if (created) navigate(`/trips/${created.id}`);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="stack">
      <PageHeader
        title={isEdit ? t('trips.form.editTitle') : t('trips.form.newTitle')}
        lead={t('trips.subtitle')}
        actions={
          <ButtonLink to={isEdit && trip ? `/trips/${trip.id}` : '/trips'} variant="secondary">
            {t('action.cancel')}
          </ButtonLink>
        }
      />

      <Card>
        <form className="stack" onSubmit={onSubmit} noValidate>
          {hasErrors ? (
            <div className="alert alert--danger" role="alert">
              {t('trips.form.errorSummary')}
            </div>
          ) : null}

          <InputField
            id="trip-name"
            label={t('trips.form.name')}
            placeholder={t('trips.form.namePlaceholder')}
            required
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            error={errors.name}
          />

          <InputField
            id="trip-destination"
            label={t('trips.form.destination')}
            placeholder={t('trips.form.destinationPlaceholder')}
            required
            value={form.destination}
            onChange={(event) => setField('destination', event.target.value)}
            error={errors.destination}
          />

          <div className="grid grid--two">
            <InputField
              id="trip-departure"
              label={t('trips.form.departure')}
              type="datetime-local"
              required
              value={form.departureLocal}
              onChange={(event) => setField('departureLocal', event.target.value)}
              error={errors.departureAt}
            />
            <InputField
              id="trip-return"
              label={t('trips.form.return')}
              type="datetime-local"
              required
              value={form.returnLocal}
              onChange={(event) => setField('returnLocal', event.target.value)}
              error={errors.returnAt}
            />
          </div>

          <InputField
            id="trip-group"
            label={t('trips.form.groupSize')}
            type="number"
            min={1}
            max={50}
            step={1}
            inputMode="numeric"
            required
            value={form.groupSize}
            onChange={(event) => setField('groupSize', event.target.value)}
            error={errors.groupSize}
          />

          <TextAreaField
            id="trip-notes"
            label={t('trips.form.notes')}
            placeholder={t('trips.form.notesPlaceholder')}
            rows={4}
            value={form.notes}
            onChange={(event) => setField('notes', event.target.value)}
            error={errors.notes}
          />

          <div className="cluster">
            <Button type="submit">{isEdit ? t('trips.form.save') : t('trips.form.create')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
