import { createTrip } from '../../domain/trip';
import { DEFAULT_LANGUAGE, type GeneratedMessage, type Language, type ReadinessAnswers, type Trip } from '../../domain/types';
import { translate } from '../../i18n/translate';
import { generateTrustedContactMessage } from '../sharing/messageGenerator';

export const TOUR_STEPS = [
  'problem',
  'purpose',
  'language',
  'trip',
  'checklist',
  'share',
  'reminder',
  'emergency',
  'offline',
  'future',
  'roadmap',
] as const;

export type TourStepId = (typeof TOUR_STEPS)[number];

export const TOUR_TOTAL = TOUR_STEPS.length;

export const TOUR_SAMPLE_TRIP_ID = 'tour-sample-trip';

const DAY_MS = 86_400_000;

export function clampStep(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  const floored = Math.floor(value);
  if (floored < 0) return 0;
  if (floored > TOUR_TOTAL - 1) return TOUR_TOTAL - 1;
  return floored;
}

export function stepIdAt(index: unknown): TourStepId {
  return TOUR_STEPS[clampStep(index)];
}

export interface SampleTripTexts {
  name: string;
  destination: string;
  notes: string;
  contactName: string;
  contactPhone: string;
  meetingPoint: string;
  safetyNotes: string;
}

export function sampleTripTexts(language: Language = DEFAULT_LANGUAGE): SampleTripTexts {
  const text = (key: string) => translate(language, `tour:tour.sample.${key}`);
  return {
    name: text('name'),
    destination: text('destination'),
    notes: text('notes'),
    contactName: text('contactName'),
    contactPhone: text('contactPhone'),
    meetingPoint: text('meetingPoint'),
    safetyNotes: text('safetyNotes'),
  };
}

export const SAMPLE_READINESS: ReadinessAnswers = {
  durationHours: 12,
  groupExperience: 'some',
  connectivity: 'unreliable',
  forecastAvailable: true,
  routeType: 'marked',
};

export function createSampleTrip(language: Language = DEFAULT_LANGUAGE, now: Date = new Date()): Trip {
  const texts = sampleTripTexts(language);
  const at = (days: number) => new Date(now.getTime() + days * DAY_MS).toISOString();
  const base = createTrip(
    {
      name: texts.name,
      destination: texts.destination,
      departureAt: at(7),
      returnAt: at(8),
      groupSize: 3,
      notes: texts.notes,
    },
    now,
  );
  const checklist = base.checklist.map((item, index) => (index < 2 ? { ...item, done: true } : item));
  return {
    ...base,
    id: TOUR_SAMPLE_TRIP_ID,
    checklist,
    readiness: { ...SAMPLE_READINESS },
    safetyPlan: {
      generatedAt: now.toISOString(),
      answers: { ...SAMPLE_READINESS },
      guidanceIds: ['water', 'offline-map'],
      trustedContactName: texts.contactName,
      trustedContactPhone: texts.contactPhone,
      meetingPoint: texts.meetingPoint,
      notes: texts.safetyNotes,
    },
  };
}

export function buildTourMessage(trip: Trip, language: Language, now: Date): GeneratedMessage {
  return generateTrustedContactMessage(trip, { language, now });
}
