export type Language = 'kk' | 'ru' | 'en';

export const SUPPORTED_LANGUAGES: Language[] = ['kk', 'ru', 'en'];
export const DEFAULT_LANGUAGE: Language = 'kk';

export type LocalizedText = Record<Language, string>;

export type TripStatus = 'draft' | 'ready' | 'completed';

export type TrackSource = 'recorded' | 'imported' | 'estimated' | 'verified';

export type ReviewStatus = 'unreviewed' | 'machine-translated' | 'human-review-required' | 'human-reviewed';

export interface GuidelineReference {
  sourceUrl: string;
  publisher: string;
  lastVerified: string;
  reviewStatus: ReviewStatus;
}

export interface ChecklistItem {
  id: string;
  templateId: string;
  label: LocalizedText;
  required: boolean;
  done: boolean;
  custom: boolean;
}

export interface ReadinessAnswers {
  durationHours: number | null;
  groupExperience: 'first-time' | 'some' | 'experienced' | null;
  connectivity: 'none' | 'unreliable' | 'good' | null;
  forecastAvailable: boolean | null;
  routeType: 'marked' | 'unmarked' | 'unknown' | null;
}

export interface SafetyPlan {
  generatedAt: string;
  answers: ReadinessAnswers;
  guidanceIds: string[];
  trustedContactName: string;
  trustedContactPhone: string;
  meetingPoint: string;
  notes: string;
}

export interface GpxPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: string;
}

export interface TrackSummary {
  pointCount: number;
  distanceMeters: number | null;
  ascentMeters: number | null;
}

export interface GpxTrack {
  id: string;
  name: string;
  source: TrackSource;
  points: GpxPoint[];
  summary: TrackSummary;
  importedAt: string;
  warnings: string[];
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  departureAt: string;
  returnAt: string;
  groupSize: number;
  notes: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  checklist: ChecklistItem[];
  readiness: ReadinessAnswers;
  safetyPlan: SafetyPlan | null;
  track: GpxTrack | null;
}

export interface TripInput {
  name: string;
  destination: string;
  departureAt: string;
  returnAt: string;
  groupSize: number;
  notes?: string;
}

export interface GeneratedMessage {
  id: string;
  tripId: string;
  kind: 'trusted-contact' | 'trip-notice' | 'email';
  language: Language;
  body: string;
  generatedAt: string;
  delivered: false;
}

export interface EmergencyContact {
  id: string;
  label: LocalizedText;
  number: string;
  description: LocalizedText;
  sourceUrl: string;
  lastVerified: string;
  reviewStatus: ReviewStatus;
}

export interface PhrasebookEntry {
  id: string;
  category: 'identity' | 'location' | 'condition' | 'request';
  kk: string;
  ru: string;
  en: string;
  reviewStatus: ReviewStatus;
}

export interface AppSettings {
  language: Language;
  units: 'metric';
  onboardingComplete: boolean;
}

export type FeatureState = 'available' | 'demo' | 'planned' | 'requires-integration' | 'needs-verification';

export interface FeatureStatusInfo {
  state: FeatureState;
  note?: string;
}

export interface TripValidationIssue {
  field: 'name' | 'destination' | 'departureAt' | 'returnAt' | 'groupSize' | 'notes';
  code: 'required' | 'invalid' | 'return-before-departure' | 'departure-in-past' | 'group-size-range';
}
