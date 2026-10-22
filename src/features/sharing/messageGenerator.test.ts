import { describe, expect, it } from 'vitest';
import { formatDateTime } from '../../domain/trip';
import type { ChecklistItem, Trip } from '../../domain/types';
import {
  buildEmailSubject,
  generateEmailDraft,
  generateTripNotice,
  generateTrustedContactMessage,
} from './messageGenerator';

const NOW = new Date('2026-05-10T06:30:00.000Z');

function checklistItem(id: string, done: boolean, required = true): ChecklistItem {
  return {
    id,
    templateId: id,
    label: { kk: id, ru: id, en: id },
    required,
    done,
    custom: false,
  };
}

const TRIP: Trip = {
  id: 'trip-1',
  name: 'Big Almaty Lake day hike',
  destination: 'Big Almaty Lake trail',
  departureAt: '2026-05-12T01:00:00.000Z',
  returnAt: '2026-05-12T12:00:00.000Z',
  groupSize: 4,
  notes: 'Meet at the trailhead; carry water.',
  status: 'ready',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
  checklist: [checklistItem('weather', true), checklistItem('water', true), checklistItem('first-aid', false)],
  readiness: {
    durationHours: 11,
    groupExperience: 'some',
    connectivity: 'unreliable',
    forecastAvailable: true,
    routeType: 'marked',
  },
  safetyPlan: {
    generatedAt: '2026-05-02T00:00:00.000Z',
    answers: {
      durationHours: 11,
      groupExperience: 'some',
      connectivity: 'unreliable',
      forecastAvailable: true,
      routeType: 'marked',
    },
    guidanceIds: ['water', 'offline-map'],
    trustedContactName: 'Aigerim',
    trustedContactPhone: '+7 700 123 45 67',
    meetingPoint: 'Trailhead parking',
    notes: 'Call before leaving the city.',
  },
  track: null,
};

describe('generateTrustedContactMessage', () => {
  it('includes the destination, Almaty times, contact details and non-official disclaimer', () => {
    const message = generateTrustedContactMessage(TRIP, { language: 'en', now: NOW });

    expect(message.kind).toBe('trusted-contact');
    expect(message.language).toBe('en');
    expect(message.delivered).toBe(false);
    expect(message.generatedAt).toBe(NOW.toISOString());
    expect(message.body).toContain('Hello Aigerim,');
    expect(message.body).toContain(TRIP.destination);
    expect(message.body).toContain(formatDateTime(TRIP.departureAt, 'en'));
    expect(message.body).toContain(formatDateTime(TRIP.returnAt, 'en'));
    expect(message.body).toContain(TRIP.safetyPlan?.trustedContactPhone);
    expect(message.body).toContain(TRIP.safetyPlan?.meetingPoint);
    expect(message.body).toContain('Checklist: 2 of 3 items done; 1 required item(s) remaining.');
    expect(message.body).toContain('Readiness guidance items saved: 2.');
    expect(message.body).toContain('not an official trip registration');
    expect(message.body).toContain('Generated only — not delivered');
    expect(message.body).toContain('you must send this message yourself');
  });

  it('is deterministic for an injected clock', () => {
    const first = generateTrustedContactMessage(TRIP, { language: 'ru', now: NOW });
    const second = generateTrustedContactMessage(TRIP, { language: 'ru', now: NOW });
    const later = generateTrustedContactMessage(TRIP, {
      language: 'ru',
      now: new Date(NOW.getTime() + 60_000),
    });

    expect(second).toEqual(first);
    expect(later.generatedAt).not.toBe(first.generatedAt);
    expect(later.body).not.toBe(first.body);
  });
});

describe('generateTripNotice', () => {
  it('always produces Kazakh and Russian notices and adds an English translation when active', () => {
    const notice = generateTripNotice(TRIP, { language: 'en', now: NOW });

    expect(notice.kk.language).toBe('kk');
    expect(notice.ru.language).toBe('ru');
    expect(notice.kk.body).toContain('Бағыт: Big Almaty Lake trail');
    expect(notice.kk.body).toContain(formatDateTime(TRIP.departureAt, 'kk'));
    expect(notice.kk.body).toContain('Тек жасалды — жеткізілген жоқ');
    expect(notice.ru.body).toContain('Направление: Big Almaty Lake trail');
    expect(notice.ru.body).toContain(formatDateTime(TRIP.returnAt, 'ru'));
    expect(notice.ru.body).toContain('Только сформировано — не доставлено');

    expect(notice.translation).not.toBeNull();
    expect(notice.translation?.language).toBe('en');
    expect(notice.translation?.body).toContain('Destination: Big Almaty Lake trail');
    expect(notice.translation?.body).toContain('not an official trip registration');
    expect(notice.translation?.delivered).toBe(false);
  });

  it('does not duplicate a translation when the active language is Kazakh or Russian', () => {
    expect(generateTripNotice(TRIP, { language: 'kk', now: NOW }).translation).toBeNull();
    expect(generateTripNotice(TRIP, { language: 'ru', now: NOW }).translation).toBeNull();
  });
});

describe('generateEmailDraft', () => {
  it('produces a subject and body but marks the draft as not delivered', () => {
    const draft = generateEmailDraft(TRIP, { language: 'ru', now: NOW });

    expect(draft.subject).toBe(buildEmailSubject(TRIP, 'ru'));
    expect(draft.subject).toContain(TRIP.name);
    expect(draft.subject).toContain(TRIP.destination);
    expect(draft.body).toContain(TRIP.destination);
    expect(draft.body).toContain(TRIP.safetyPlan?.trustedContactName);
    expect(draft.body).toContain('Только сформировано — не доставлено');
    expect(draft.message.kind).toBe('email');
    expect(draft.message.language).toBe('ru');
    expect(draft.message.body).toBe(draft.body);
    expect(draft.message.delivered).toBe(false);
  });
});
