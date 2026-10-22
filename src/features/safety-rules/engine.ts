import type { Language, LocalizedText, ReadinessAnswers, ReviewStatus } from '../../domain/types';
import { translate } from '../../i18n/translate';
import { GUIDANCE_CATALOG } from './catalog';
import { translateSafety } from './i18n';

export type GuidanceSeverity = 'info' | 'caution' | 'critical';
export type GuidanceClassification = 'general' | 'official';
export type GuidanceTranslationStatus = 'machine-assisted' | 'human-reviewed';

export type ConnectivityValue = NonNullable<ReadinessAnswers['connectivity']>;
export type GroupExperienceValue = NonNullable<ReadinessAnswers['groupExperience']>;
export type RouteTypeValue = NonNullable<ReadinessAnswers['routeType']>;

export interface ValueCondition<T extends string> {
  in: T[];
  includeUnknown?: boolean;
}

export interface BooleanCondition {
  in: boolean[];
  includeUnknown?: boolean;
}

export interface DurationCondition {
  min?: number;
  max?: number;
  includeUnknown?: boolean;
}

export interface RuleConditions {
  durationHours?: DurationCondition;
  connectivity?: ValueCondition<ConnectivityValue>;
  groupExperience?: ValueCondition<GroupExperienceValue>;
  forecastAvailable?: BooleanCondition;
  routeType?: ValueCondition<RouteTypeValue>;
  anyOf?: RuleConditions[];
}

export interface GuidanceSource {
  publisher: string;
  url: string;
  lastVerified: string;
  reviewStatus: ReviewStatus;
  note: LocalizedText;
}

export interface GuidanceRule {
  id: string;
  severity: GuidanceSeverity;
  classification: GuidanceClassification;
  conditions: RuleConditions;
  title: LocalizedText;
  explanation: LocalizedText;
  source: GuidanceSource;
  translationStatus: GuidanceTranslationStatus;
}

export interface GuidanceInput {
  durationHours?: number | null;
  groupExperience?: GroupExperienceValue | null;
  connectivity?: ConnectivityValue | null;
  forecastAvailable?: boolean | null;
  routeType?: RouteTypeValue | null;
}

export interface GuidanceMatch {
  rule: GuidanceRule;
  severity: GuidanceSeverity;
  classification: GuidanceClassification;
  reasons: string[];
}

export interface GuidanceContext {
  language?: Language;
}

export interface InputCompleteness {
  provided: number;
  total: number;
  missing: GuidanceInputKey[];
}

export type GuidanceInputKey = 'durationHours' | 'groupExperience' | 'connectivity' | 'forecastAvailable' | 'routeType';

interface NormalizedGuidanceInput {
  durationHours: number | null;
  groupExperience: GroupExperienceValue | null;
  connectivity: ConnectivityValue | null;
  forecastAvailable: boolean | null;
  routeType: RouteTypeValue | null;
}

interface ConditionResult {
  matched: boolean;
  reasons: string[];
}

const EXPERIENCE_VALUES = new Set<GroupExperienceValue>(['first-time', 'some', 'experienced']);
const CONNECTIVITY_VALUES = new Set<ConnectivityValue>(['none', 'unreliable', 'good']);
const ROUTE_VALUES = new Set<RouteTypeValue>(['marked', 'unmarked', 'unknown']);

const SEVERITY_ORDER: Record<GuidanceSeverity, number> = {
  critical: 0,
  caution: 1,
  info: 2,
};

const VALUE_NAMESPACES = {
  connectivity: 'safety.connectivity',
  groupExperience: 'safety.experience',
  routeType: 'safety.route',
} as const;

const VALUE_REASON_KEYS = {
  connectivity: 'safety.reason.connectivity',
  groupExperience: 'safety.reason.groupExperience',
  routeType: 'safety.reason.routeType',
} as const;

const UNKNOWN_REASON_KEYS = {
  connectivity: 'safety.reason.connectivityUnknown',
  groupExperience: 'safety.reason.groupExperienceUnknown',
  routeType: 'safety.reason.routeTypeUnknown',
} as const;

const VALUE_FIELDS: GuidanceInputKey[] = [
  'durationHours',
  'groupExperience',
  'connectivity',
  'forecastAvailable',
  'routeType',
];

function normalizeDuration(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

function normalizeExperience(value: unknown): GroupExperienceValue | null {
  return typeof value === 'string' && EXPERIENCE_VALUES.has(value as GroupExperienceValue)
    ? (value as GroupExperienceValue)
    : null;
}

function normalizeConnectivity(value: unknown): ConnectivityValue | null {
  return typeof value === 'string' && CONNECTIVITY_VALUES.has(value as ConnectivityValue)
    ? (value as ConnectivityValue)
    : null;
}

function normalizeRouteType(value: unknown): RouteTypeValue | null {
  return typeof value === 'string' && ROUTE_VALUES.has(value as RouteTypeValue)
    ? (value as RouteTypeValue)
    : null;
}

function normalizeAnswers(input: GuidanceInput): NormalizedGuidanceInput {
  return {
    durationHours: normalizeDuration(input.durationHours),
    groupExperience: normalizeExperience(input.groupExperience),
    connectivity: normalizeConnectivity(input.connectivity),
    forecastAvailable: typeof input.forecastAvailable === 'boolean' ? input.forecastAvailable : null,
    routeType: normalizeRouteType(input.routeType),
  };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

function reason(language: Language, key: string, vars?: Record<string, string | number>): string {
  return translateSafety((candidate, values) => translate(language, candidate, values), key, vars);
}

function evaluateDuration(
  value: number | null,
  condition: DurationCondition,
  language: Language,
): ConditionResult {
  if (value === null) {
    if (!condition.includeUnknown) return { matched: false, reasons: [] };
    return { matched: true, reasons: [reason(language, 'safety.reason.durationUnknown')] };
  }

  const meetsMin = condition.min === undefined || value >= condition.min;
  const meetsMax = condition.max === undefined || value <= condition.max;
  if (!meetsMin || !meetsMax) return { matched: false, reasons: [] };

  if (condition.min !== undefined && condition.max !== undefined) {
    return {
      matched: true,
      reasons: [
        reason(language, 'safety.reason.durationBetween', {
          hours: value,
          min: condition.min,
          max: condition.max,
        }),
      ],
    };
  }
  if (condition.min !== undefined) {
    return {
      matched: true,
      reasons: [reason(language, 'safety.reason.durationMin', { hours: value, min: condition.min })],
    };
  }
  if (condition.max !== undefined) {
    return {
      matched: true,
      reasons: [reason(language, 'safety.reason.durationMax', { hours: value, max: condition.max })],
    };
  }
  return {
    matched: true,
    reasons: [reason(language, 'safety.reason.durationKnown', { hours: value })],
  };
}

function evaluateValueCondition<T extends string>(
  value: T | null,
  condition: ValueCondition<T>,
  language: Language,
  field: keyof typeof VALUE_REASON_KEYS,
): ConditionResult {
  if (value === null) {
    if (!condition.includeUnknown) return { matched: false, reasons: [] };
    return { matched: true, reasons: [reason(language, UNKNOWN_REASON_KEYS[field])] };
  }
  if (!condition.in.includes(value)) return { matched: false, reasons: [] };

  const localizedValue = reason(language, `${VALUE_NAMESPACES[field]}.${value}`);
  return {
    matched: true,
    reasons: [reason(language, VALUE_REASON_KEYS[field], { value: localizedValue })],
  };
}

function evaluateBooleanCondition(
  value: boolean | null,
  condition: BooleanCondition,
  language: Language,
): ConditionResult {
  if (value === null) {
    if (!condition.includeUnknown) return { matched: false, reasons: [] };
    return { matched: true, reasons: [reason(language, 'safety.reason.forecastUnknown')] };
  }
  if (!condition.in.includes(value)) return { matched: false, reasons: [] };

  return {
    matched: true,
    reasons: [reason(language, value ? 'safety.reason.forecastChecked' : 'safety.reason.forecastUnchecked')],
  };
}

function evaluateConditions(
  conditions: RuleConditions,
  answers: NormalizedGuidanceInput,
  language: Language,
): ConditionResult {
  const reasons: string[] = [];

  if (conditions.durationHours) {
    const result = evaluateDuration(answers.durationHours, conditions.durationHours, language);
    if (!result.matched) return { matched: false, reasons: [] };
    reasons.push(...result.reasons);
  }

  if (conditions.connectivity) {
    const result = evaluateValueCondition(answers.connectivity, conditions.connectivity, language, 'connectivity');
    if (!result.matched) return { matched: false, reasons: [] };
    reasons.push(...result.reasons);
  }

  if (conditions.groupExperience) {
    const result = evaluateValueCondition(
      answers.groupExperience,
      conditions.groupExperience,
      language,
      'groupExperience',
    );
    if (!result.matched) return { matched: false, reasons: [] };
    reasons.push(...result.reasons);
  }

  if (conditions.forecastAvailable) {
    const result = evaluateBooleanCondition(answers.forecastAvailable, conditions.forecastAvailable, language);
    if (!result.matched) return { matched: false, reasons: [] };
    reasons.push(...result.reasons);
  }

  if (conditions.routeType) {
    const result = evaluateValueCondition(answers.routeType, conditions.routeType, language, 'routeType');
    if (!result.matched) return { matched: false, reasons: [] };
    reasons.push(...result.reasons);
  }

  if (conditions.anyOf && conditions.anyOf.length > 0) {
    const alternatives = conditions.anyOf.map((condition) => evaluateConditions(condition, answers, language));
    const matchedAlternatives = alternatives.filter((result) => result.matched);
    if (matchedAlternatives.length === 0) return { matched: false, reasons: [] };
    for (const result of matchedAlternatives) reasons.push(...result.reasons);
  }

  return { matched: true, reasons: dedupe(reasons) };
}

/**
 * Evaluates the static guidance catalog against readiness answers.
 *
 * Behavior for missing or contradictory inputs:
 * - A duration that is not a finite number greater than zero (including 0,
 *   negative values, NaN, and Infinity) is treated as unknown, not as a short trip.
 * - Unknown values never satisfy a rule that requires a specific value or range,
 *   unless the rule's JSON sets `includeUnknown: true`. Those rules then add an
 *   "unknown" reason and are presented as conservative reminders to confirm the input.
 * - Fields are evaluated independently; the engine does not infer cross-field
 *   contradictions or fill in missing answers with assumed facts.
 * - No score, rating, or safety guarantee is produced.
 *
 * Matches are sorted by severity (critical, caution, info) and then by catalog
 * order, so repeated calls with the same input produce the same order.
 */
export function evaluateGuidance(input: GuidanceInput, context: GuidanceContext = {}): GuidanceMatch[] {
  const language = context.language ?? 'en';
  const answers = normalizeAnswers(input);

  const ranked = GUIDANCE_CATALOG.rules
    .map((rule, index) => {
      const result = evaluateConditions(rule.conditions, answers, language);
      return result.matched ? { rule, result, index } : null;
    })
    .filter((entry): entry is { rule: GuidanceRule; result: ConditionResult; index: number } => entry !== null)
    .sort((left, right) => {
      const severityDifference = SEVERITY_ORDER[left.rule.severity] - SEVERITY_ORDER[right.rule.severity];
      return severityDifference !== 0 ? severityDifference : left.index - right.index;
    });

  return ranked.map(({ rule, result }) => ({
    rule,
    severity: rule.severity,
    classification: rule.classification,
    reasons: result.reasons,
  }));
}

export function getMissingInputs(input: GuidanceInput): GuidanceInputKey[] {
  const answers = normalizeAnswers(input);
  return VALUE_FIELDS.filter((field) => answers[field] === null);
}

export function inputCompleteness(input: GuidanceInput): InputCompleteness {
  const missing = getMissingInputs(input);
  return {
    provided: VALUE_FIELDS.length - missing.length,
    total: VALUE_FIELDS.length,
    missing,
  };
}
