import type {
  ChecklistItem,
  Language,
  LocalizedText,
  ReadinessAnswers,
  Trip,
  TripInput,
  TripValidationIssue,
} from './types';

export const CHECKLIST_TEMPLATES: Array<{
  id: string;
  required: boolean;
  label: LocalizedText;
}> = [
  {
    id: 'weather-checked',
    required: true,
    label: {
      kk: 'Ауа райы болжамы тексерілді',
      ru: 'Прогноз погоды проверен',
      en: 'Weather forecast checked',
    },
  },
  {
    id: 'route-shared',
    required: true,
    label: {
      kk: 'Маршрут сенімді адамға хабарланды',
      ru: 'Маршрут сообщён доверенному человеку',
      en: 'Route shared with a trusted contact',
    },
  },
  {
    id: 'water-food',
    required: true,
    label: {
      kk: 'Су мен азық-түлік жеткілікті',
      ru: 'Достаточно воды и еды',
      en: 'Enough water and food',
    },
  },
  {
    id: 'clothing',
    required: true,
    label: {
      kk: 'Ауа райына сай киім және қосалқы киім',
      ru: 'Одежда по погоде и запасная одежда',
      en: 'Weather-appropriate clothing and a spare layer',
    },
  },
  {
    id: 'power-bank',
    required: false,
    label: {
      kk: 'Қуат банкі және зарядталған телефон',
      ru: 'Power bank и заряженный телефон',
      en: 'Power bank and charged phone',
    },
  },
  {
    id: 'first-aid',
    required: true,
    label: {
      kk: 'Алғашқы көмек жинағы',
      ru: 'Аптечка первой помощи',
      en: 'First-aid kit',
    },
  },
  {
    id: 'headlamp',
    required: false,
    label: {
      kk: 'Фонарь және қосалқы батареялар',
      ru: 'Фонарь и запасные батарейки',
      en: 'Headlamp and spare batteries',
    },
  },
  {
    id: 'offline-map',
    required: false,
    label: {
      kk: 'Офлайн карта мен бағыт жүктелді',
      ru: 'Офлайн-карта и маршрут загружены',
      en: 'Offline map and route downloaded',
    },
  },
  {
    id: 'return-time',
    required: true,
    label: {
      kk: 'Қайту уақыты туралы келісілді',
      ru: 'Время возвращения согласовано',
      en: 'Return time agreed',
    },
  },
  {
    id: 'emergency-info',
    required: true,
    label: {
      kk: '112 және құтқару қызметінің нөмірлері белгілі',
      ru: 'Известны номера 112 и спасательной службы',
      en: 'Emergency and rescue numbers known',
    },
  },
];

export const EMPTY_READINESS: ReadinessAnswers = {
  durationHours: null,
  groupExperience: null,
  connectivity: null,
  forecastAvailable: null,
  routeType: null,
};

export function createChecklistItems(): ChecklistItem[] {
  return CHECKLIST_TEMPLATES.map((template) => ({
    id: `chk-${template.id}`,
    templateId: template.id,
    label: { ...template.label },
    required: template.required,
    done: false,
    custom: false,
  }));
}

export function createTrip(input: TripInput, now: Date = new Date()): Trip {
  const id = createId();
  const timestamp = now.toISOString();
  return {
    id,
    name: input.name.trim(),
    destination: input.destination.trim(),
    departureAt: input.departureAt,
    returnAt: input.returnAt,
    groupSize: input.groupSize,
    notes: input.notes?.trim() ?? '',
    status: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp,
    checklist: createChecklistItems(),
    readiness: { ...EMPTY_READINESS },
    safetyPlan: null,
    track: null,
  };
}

export function duplicateTrip(trip: Trip, now: Date = new Date()): Trip {
  const timestamp = now.toISOString();
  return {
    ...structuredClone(trip),
    id: createId(),
    name: `${trip.name}`,
    status: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp,
    safetyPlan: null,
    track: null,
    checklist: trip.checklist.map((item) => ({ ...item, label: { ...item.label }, done: false })),
  };
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function validateTripInput(input: TripInput, now: Date = new Date()): TripValidationIssue[] {
  const issues: TripValidationIssue[] = [];
  if (!input.name.trim()) issues.push({ field: 'name', code: 'required' });
  if (!input.destination.trim()) issues.push({ field: 'destination', code: 'required' });

  const departure = parseDateTime(input.departureAt);
  const returnDate = parseDateTime(input.returnAt);

  if (!departure) issues.push({ field: 'departureAt', code: 'invalid' });
  if (!returnDate) issues.push({ field: 'returnAt', code: 'invalid' });
  if (departure && returnDate && returnDate.getTime() <= departure.getTime()) {
    issues.push({ field: 'returnAt', code: 'return-before-departure' });
  }
  if (departure && departure.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
    issues.push({ field: 'departureAt', code: 'departure-in-past' });
  }
  if (!Number.isInteger(input.groupSize) || input.groupSize < 1 || input.groupSize > 50) {
    issues.push({ field: 'groupSize', code: 'group-size-range' });
  }
  return issues;
}

export function parseDateTime(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromLocalInputValue(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export function formatDateTime(iso: string, language: Language): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const locale = language === 'kk' ? 'kk-KZ' : language === 'ru' ? 'ru-KZ' : 'en-KZ';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Almaty',
  }).format(date);
}

export function durationHours(trip: Pick<Trip, 'departureAt' | 'returnAt'>): number | null {
  const start = parseDateTime(trip.departureAt);
  const end = parseDateTime(trip.returnAt);
  if (!start || !end || end <= start) return null;
  return Math.round(((end.getTime() - start.getTime()) / 3_600_000) * 10) / 10;
}

export function checklistProgress(items: ChecklistItem[]): { done: number; total: number; requiredRemaining: number } {
  const done = items.filter((item) => item.done).length;
  const requiredRemaining = items.filter((item) => item.required && !item.done).length;
  return { done, total: items.length, requiredRemaining };
}
