import { checklistProgress, formatDateTime } from '../../domain/trip';
import { translate } from '../../i18n/translate';
import type { GeneratedMessage, Language, Trip } from '../../domain/types';

export type MessageKind = GeneratedMessage['kind'];

export interface GenerateOptions {
  language: Language;
  now?: Date;
}

export interface EmailDraft {
  subject: string;
  body: string;
  message: GeneratedMessage;
}

export interface TripNoticeSet {
  kk: GeneratedMessage;
  ru: GeneratedMessage;
  translation: GeneratedMessage | null;
}

function resolveNow(options: GenerateOptions): Date {
  return options.now ?? new Date();
}

function contactDetails(trip: Trip): { name: string; phone: string; meetingPoint: string } {
  return {
    name: trip.safetyPlan?.trustedContactName.trim() ?? '',
    phone: trip.safetyPlan?.trustedContactPhone.trim() ?? '',
    meetingPoint: trip.safetyPlan?.meetingPoint.trim() ?? '',
  };
}

function buildSummaryLines(trip: Trip, language: Language): string[] {
  const contact = contactDetails(trip);
  const checklist = checklistProgress(trip.checklist);
  const guidanceCount = trip.safetyPlan?.guidanceIds.length ?? 0;
  const notes = trip.notes.trim();

  const lines = [
    translate(language, 'sharing:sharing.message.trip.name', { name: trip.name }),
    translate(language, 'sharing:sharing.message.trip.destination', { destination: trip.destination }),
    translate(language, 'sharing:sharing.message.trip.departure', {
      date: formatDateTime(trip.departureAt, language),
    }),
    translate(language, 'sharing:sharing.message.trip.return', {
      date: formatDateTime(trip.returnAt, language),
    }),
    translate(language, 'sharing:sharing.message.trip.group', { count: trip.groupSize }),
    notes
      ? translate(language, 'sharing:sharing.message.trip.notes', { notes })
      : translate(language, 'sharing:sharing.message.trip.noNotes'),
  ];

  if (contact.name || contact.phone) {
    lines.push(
      translate(language, 'sharing:sharing.message.contact.name', {
        name: contact.name || translate(language, 'sharing:sharing.message.unknown'),
      }),
      translate(language, 'sharing:sharing.message.contact.phone', {
        phone: contact.phone || translate(language, 'sharing:sharing.message.unknown'),
      }),
    );
  } else {
    lines.push(translate(language, 'sharing:sharing.message.contact.missing'));
  }

  lines.push(
    contact.meetingPoint
      ? translate(language, 'sharing:sharing.message.meetingPoint', { point: contact.meetingPoint })
      : translate(language, 'sharing:sharing.message.meetingPoint.missing'),
    translate(language, 'sharing:sharing.message.checklist', {
      done: checklist.done,
      total: checklist.total,
      remaining: checklist.requiredRemaining,
    }),
    guidanceCount > 0
      ? translate(language, 'sharing:sharing.message.guidance', { count: guidanceCount })
      : translate(language, 'sharing:sharing.message.guidance.none'),
  );

  return lines;
}

function buildFooterLines(language: Language, generatedAt: string): string[] {
  return [
    translate(language, 'sharing:sharing.message.generatedAt', {
      date: formatDateTime(generatedAt, language),
    }),
    translate(language, 'sharing:sharing.message.disclaimer'),
  ];
}

function buildTrustedContactBody(trip: Trip, language: Language, generatedAt: string): string {
  const contact = contactDetails(trip);
  const greeting = contact.name
    ? translate(language, 'sharing:sharing.message.trusted.greeting', { name: contact.name })
    : translate(language, 'sharing:sharing.message.trusted.greetingGeneric');

  return [
    greeting,
    '',
    translate(language, 'sharing:sharing.message.trusted.intro'),
    '',
    ...buildSummaryLines(trip, language),
    '',
    translate(language, 'sharing:sharing.message.trusted.ask'),
    '',
    ...buildFooterLines(language, generatedAt),
  ].join('\n');
}

function buildTripNoticeBody(trip: Trip, language: Language, generatedAt: string): string {
  return [
    translate(language, 'sharing:sharing.message.notice.heading'),
    '',
    ...buildSummaryLines(trip, language),
    '',
    ...buildFooterLines(language, generatedAt),
  ].join('\n');
}

function buildEmailBody(trip: Trip, language: Language, generatedAt: string): string {
  return [
    translate(language, 'sharing:sharing.message.email.greeting'),
    '',
    translate(language, 'sharing:sharing.message.email.intro'),
    '',
    ...buildSummaryLines(trip, language),
    '',
    ...buildFooterLines(language, generatedAt),
  ].join('\n');
}

function buildMessage(
  trip: Trip,
  kind: MessageKind,
  language: Language,
  body: string,
  generatedAt: string,
): GeneratedMessage {
  return {
    id: `share-${trip.id}-${kind}-${language}-${generatedAt}`,
    tripId: trip.id,
    kind,
    language,
    body,
    generatedAt,
    delivered: false,
  };
}

export function buildEmailSubject(trip: Trip, language: Language): string {
  return translate(language, 'sharing:sharing.message.email.subject', {
    name: trip.name,
    destination: trip.destination,
  });
}

export function generateTrustedContactMessage(trip: Trip, options: GenerateOptions): GeneratedMessage {
  const generatedAt = resolveNow(options).toISOString();
  const body = buildTrustedContactBody(trip, options.language, generatedAt);
  return buildMessage(trip, 'trusted-contact', options.language, body, generatedAt);
}

export function generateTripNotice(trip: Trip, options: GenerateOptions): TripNoticeSet {
  const generatedAt = resolveNow(options).toISOString();
  const kk = buildMessage(
    trip,
    'trip-notice',
    'kk',
    buildTripNoticeBody(trip, 'kk', generatedAt),
    generatedAt,
  );
  const ru = buildMessage(
    trip,
    'trip-notice',
    'ru',
    buildTripNoticeBody(trip, 'ru', generatedAt),
    generatedAt,
  );
  const translation =
    options.language === 'en'
      ? buildMessage(
          trip,
          'trip-notice',
          'en',
          buildTripNoticeBody(trip, 'en', generatedAt),
          generatedAt,
        )
      : null;

  return { kk, ru, translation };
}

export function generateEmailDraft(trip: Trip, options: GenerateOptions): EmailDraft {
  const generatedAt = resolveNow(options).toISOString();
  const subject = buildEmailSubject(trip, options.language);
  const body = buildEmailBody(trip, options.language, generatedAt);
  return {
    subject,
    body,
    message: buildMessage(trip, 'email', options.language, body, generatedAt),
  };
}
