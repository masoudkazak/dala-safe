import { DEFAULT_LANGUAGE, type Language, type Trip } from '../../domain/types';
import { clampStep, createSampleTrip } from './tourData';

export interface TourState {
  currentStep: number;
  language: Language;
  sampleNow: number;
  sampleTrip: Trip;
}

export type TourTripPatch = Partial<
  Pick<Trip, 'name' | 'destination' | 'departureAt' | 'returnAt' | 'groupSize' | 'notes'>
>;

export type TourAction =
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'goto'; step: number }
  | { type: 'language'; language: Language }
  | { type: 'toggleChecklist'; id: string }
  | { type: 'patchTrip'; patch: TourTripPatch }
  | { type: 'reset'; now?: Date };

const LANGUAGES = new Set<Language>([DEFAULT_LANGUAGE, 'ru', 'en']);

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && LANGUAGES.has(value as Language);
}

function isTourTrip(value: unknown): value is Trip {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Trip>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.destination === 'string' &&
    typeof candidate.departureAt === 'string' &&
    typeof candidate.returnAt === 'string' &&
    typeof candidate.groupSize === 'number' &&
    Array.isArray(candidate.checklist)
  );
}

function hasPatchField(patch: unknown, field: keyof TourTripPatch): boolean {
  return typeof patch === 'object' && patch !== null && field in patch;
}

/**
 * Rebuilds a usable state from anything the reducer is handed, so unknown or
 * corrupted state degrades to the default sample instead of throwing.
 */
export function normalizeTourState(input: unknown, now: Date = new Date()): TourState {
  const record: Record<string, unknown> =
    typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
  const language = isLanguage(record.language) ? record.language : DEFAULT_LANGUAGE;
  const sampleNow =
    typeof record.sampleNow === 'number' && Number.isFinite(record.sampleNow)
      ? record.sampleNow
      : now.getTime();
  const sampleTrip = isTourTrip(record.sampleTrip)
    ? (record.sampleTrip as Trip)
    : createSampleTrip(language, new Date(sampleNow));
  return {
    currentStep: clampStep(record.currentStep),
    language,
    sampleNow,
    sampleTrip,
  };
}

export function createTourState(language: Language = DEFAULT_LANGUAGE, now: Date = new Date()): TourState {
  return {
    currentStep: 0,
    language,
    sampleNow: now.getTime(),
    sampleTrip: createSampleTrip(language, now),
  };
}

export function tourReducer(state: TourState, action: TourAction): TourState {
  const safe = normalizeTourState(state);
  if (action === null || action === undefined || typeof action !== 'object') return safe;

  switch (action.type) {
    case 'next':
      return { ...safe, currentStep: clampStep(safe.currentStep + 1) };
    case 'back':
      return { ...safe, currentStep: clampStep(safe.currentStep - 1) };
    case 'goto':
      return { ...safe, currentStep: clampStep(action.step) };
    case 'language': {
      if (!isLanguage(action.language) || action.language === safe.language) return safe;
      return {
        currentStep: safe.currentStep,
        language: action.language,
        sampleNow: safe.sampleNow,
        sampleTrip: createSampleTrip(action.language, new Date(safe.sampleNow)),
      };
    }
    case 'toggleChecklist':
      return {
        ...safe,
        sampleTrip: {
          ...safe.sampleTrip,
          checklist: safe.sampleTrip.checklist.map((item) =>
            item.id === action.id ? { ...item, done: !item.done } : item,
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    case 'patchTrip': {
      const patch = action.patch;
      const next: TourTripPatch = {};
      if (hasPatchField(patch, 'name')) next.name = String(patch.name ?? '');
      if (hasPatchField(patch, 'destination')) next.destination = String(patch.destination ?? '');
      if (hasPatchField(patch, 'departureAt')) next.departureAt = String(patch.departureAt ?? '');
      if (hasPatchField(patch, 'returnAt')) next.returnAt = String(patch.returnAt ?? '');
      if (hasPatchField(patch, 'groupSize')) {
        const size = Number(patch.groupSize);
        next.groupSize = Number.isFinite(size) ? size : 0;
      }
      if (hasPatchField(patch, 'notes')) next.notes = String(patch.notes ?? '');
      return {
        ...safe,
        sampleTrip: {
          ...safe.sampleTrip,
          ...next,
          updatedAt: new Date().toISOString(),
        },
      };
    }
    case 'reset': {
      const now = action.now ?? new Date();
      return {
        currentStep: safe.currentStep,
        language: safe.language,
        sampleNow: now.getTime(),
        sampleTrip: createSampleTrip(safe.language, now),
      };
    }
    default:
      return safe;
  }
}
