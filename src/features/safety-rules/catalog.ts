import hikingGuidance from '../../data/rules/hiking-guidance.json';
import type { LocalizedText, ReviewStatus } from '../../domain/types';
import type {
  BooleanCondition,
  DurationCondition,
  GuidanceClassification,
  GuidanceRule,
  GuidanceSeverity,
  GuidanceTranslationStatus,
  RuleConditions,
  ValueCondition,
} from './engine';

export interface GuidanceCatalog {
  version: string;
  lastReviewed: string;
  reviewStatus: ReviewStatus;
  translationStatus: GuidanceTranslationStatus;
  sourceNote: LocalizedText;
  rules: GuidanceRule[];
}

const SEVERITIES = new Set<GuidanceSeverity>(['info', 'caution', 'critical']);
const CLASSIFICATIONS = new Set<GuidanceClassification>(['general', 'official']);
const TRANSLATION_STATUSES = new Set<GuidanceTranslationStatus>([
  'machine-assisted',
  'human-reviewed',
]);
const REVIEW_STATUSES = new Set<ReviewStatus>([
  'unreviewed',
  'machine-translated',
  'human-review-required',
  'human-reviewed',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isLocalizedText(value: unknown): value is LocalizedText {
  if (!isRecord(value)) return false;
  return isNonEmptyString(value.kk) && isNonEmptyString(value.ru) && isNonEmptyString(value.en);
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === 'string' && REVIEW_STATUSES.has(value as ReviewStatus);
}

function isSource(value: unknown): value is GuidanceRule['source'] {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.publisher) &&
    isNonEmptyString(value.url) &&
    isNonEmptyString(value.lastVerified) &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.lastVerified) &&
    isReviewStatus(value.reviewStatus) &&
    isLocalizedText(value.note)
  );
}

function isDurationCondition(value: unknown): value is DurationCondition {
  if (!isRecord(value)) return false;
  const minValid = value.min === undefined || (typeof value.min === 'number' && Number.isFinite(value.min));
  const maxValid = value.max === undefined || (typeof value.max === 'number' && Number.isFinite(value.max));
  const unknownValid = value.includeUnknown === undefined || typeof value.includeUnknown === 'boolean';
  return minValid && maxValid && unknownValid;
}

function isValueCondition(value: unknown): value is ValueCondition<string> {
  if (!isRecord(value)) return false;
  return (
    Array.isArray(value.in) &&
    value.in.length > 0 &&
    value.in.every((entry) => typeof entry === 'string') &&
    (value.includeUnknown === undefined || typeof value.includeUnknown === 'boolean')
  );
}

function isBooleanCondition(value: unknown): value is BooleanCondition {
  if (!isRecord(value)) return false;
  return (
    Array.isArray(value.in) &&
    value.in.length > 0 &&
    value.in.every((entry) => typeof entry === 'boolean') &&
    (value.includeUnknown === undefined || typeof value.includeUnknown === 'boolean')
  );
}

function isRuleConditions(value: unknown): value is RuleConditions {
  if (!isRecord(value)) return false;
  if (value.durationHours !== undefined && !isDurationCondition(value.durationHours)) return false;
  if (value.connectivity !== undefined && !isValueCondition(value.connectivity)) return false;
  if (value.groupExperience !== undefined && !isValueCondition(value.groupExperience)) return false;
  if (value.forecastAvailable !== undefined && !isBooleanCondition(value.forecastAvailable)) return false;
  if (value.routeType !== undefined && !isValueCondition(value.routeType)) return false;
  if (
    value.anyOf !== undefined &&
    (!Array.isArray(value.anyOf) ||
      value.anyOf.length === 0 ||
      !value.anyOf.every((condition) => isRuleConditions(condition)))
  ) {
    return false;
  }
  return Object.keys(value).length > 0;
}

function isGuidanceRule(value: unknown): value is GuidanceRule {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    typeof value.severity === 'string' &&
    SEVERITIES.has(value.severity as GuidanceSeverity) &&
    typeof value.classification === 'string' &&
    CLASSIFICATIONS.has(value.classification as GuidanceClassification) &&
    isRuleConditions(value.conditions) &&
    isLocalizedText(value.title) &&
    isLocalizedText(value.explanation) &&
    isSource(value.source) &&
    typeof value.translationStatus === 'string' &&
    TRANSLATION_STATUSES.has(value.translationStatus as GuidanceTranslationStatus)
  );
}

export function parseGuidanceCatalog(raw: unknown): GuidanceCatalog {
  if (!isRecord(raw)) throw new Error('Invalid guidance catalog: expected an object');

  const { version, lastReviewed, reviewStatus, translationStatus, sourceNote, rules } = raw;
  if (!isNonEmptyString(version)) throw new Error('Invalid guidance catalog: version is required');
  if (!isNonEmptyString(lastReviewed) || !/^\d{4}-\d{2}-\d{2}$/.test(lastReviewed)) {
    throw new Error('Invalid guidance catalog: lastReviewed must be an ISO date');
  }
  if (!isReviewStatus(reviewStatus)) throw new Error('Invalid guidance catalog: invalid reviewStatus');
  if (
    typeof translationStatus !== 'string' ||
    !TRANSLATION_STATUSES.has(translationStatus as GuidanceTranslationStatus)
  ) {
    throw new Error('Invalid guidance catalog: invalid translationStatus');
  }
  if (!isLocalizedText(sourceNote)) throw new Error('Invalid guidance catalog: sourceNote is required');
  if (!Array.isArray(rules) || rules.length === 0) {
    throw new Error('Invalid guidance catalog: at least one rule is required');
  }

  const ids = new Set<string>();
  rules.forEach((rule, index) => {
    if (!isGuidanceRule(rule)) throw new Error(`Invalid guidance catalog: rule at index ${index} is malformed`);
    if (ids.has(rule.id)) throw new Error(`Invalid guidance catalog: duplicate rule id "${rule.id}"`);
    ids.add(rule.id);
  });

  return {
    version,
    lastReviewed,
    reviewStatus,
    translationStatus: translationStatus as GuidanceTranslationStatus,
    sourceNote,
    rules: rules as GuidanceRule[],
  };
}

export const GUIDANCE_CATALOG: GuidanceCatalog = parseGuidanceCatalog(hikingGuidance);

export function getGuidanceById(id: string): GuidanceRule | undefined {
  return GUIDANCE_CATALOG.rules.find((rule) => rule.id === id);
}
