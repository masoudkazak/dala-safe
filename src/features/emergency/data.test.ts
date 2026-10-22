import { describe, expect, it } from 'vitest';
import {
  EMERGENCY_CONTACTS,
  EMERGENCY_GUIDANCE,
  EMERGENCY_LAST_VERIFIED,
  PHRASEBOOK,
  PHRASEBOOK_CATEGORIES,
} from './data';

const EXPECTED_NUMBERS = ['112', '101', '102', '103', '104', '109'];

describe('emergency contact data', () => {
  it('contains only the contacts approved in docs/safety-sources.md §4', () => {
    expect(EMERGENCY_CONTACTS.map((contact) => contact.number)).toEqual(EXPECTED_NUMBERS);
  });

  it.each(EMERGENCY_CONTACTS.map((contact) => [contact.id, contact] as const))(
    'contact %s has complete source, date, review and translation metadata',
    (_id, contact) => {
      expect(contact.sourceUrl).toMatch(/^https:\/\//);
      expect(contact.lastVerified).toBe(EMERGENCY_LAST_VERIFIED);
      expect(contact.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(contact.reviewStatus).toBe('human-review-required');

      for (const language of ['kk', 'ru', 'en'] as const) {
        expect(contact.label[language].trim().length).toBeGreaterThan(0);
        expect(contact.description[language].trim().length).toBeGreaterThan(0);
      }
    },
  );

  it('labels 109 as an Almaty city service and keeps 112 primary', () => {
    expect(EMERGENCY_CONTACTS[0].id).toBe('contact-112');
    const almaty = EMERGENCY_CONTACTS.find((contact) => contact.number === '109');
    expect(almaty?.scope).toBe('almaty-city');
    expect(almaty?.description.en).toContain('Almaty city only');
    expect(almaty?.description.en).toContain('not a national mountain-rescue number');
    expect(almaty?.sourceUrl).toContain('almaty109.kz');
  });

  it('does not add unverified regional or volunteer numbers', () => {
    const serialized = JSON.stringify(EMERGENCY_CONTACTS);
    expect(serialized).not.toContain('372 15 60');
    expect(serialized).not.toContain('271 44 90');
    expect(serialized).not.toContain('rescuekz');
    expect(serialized).not.toMatch(/response time/i);
  });
});

describe('emergency guidance data', () => {
  it.each(EMERGENCY_GUIDANCE.map((item) => [item.id, item] as const))(
    'guidance %s carries an official source, date and review state',
    (_id, item) => {
      expect(item.sourceUrl).toMatch(/^https:\/\//);
      expect(item.lastVerified).toBe(EMERGENCY_LAST_VERIFIED);
      expect(item.reviewStatus).toBe('human-review-required');
      expect(item.publisher.trim().length).toBeGreaterThan(0);

      for (const language of ['kk', 'ru', 'en'] as const) {
        expect(item.title[language].trim().length).toBeGreaterThan(0);
        expect(item.body[language].trim().length).toBeGreaterThan(0);
      }
    },
  );
});

describe('dispatcher phrasebook data', () => {
  it('has all three languages and reviewed-state metadata on every phrase', () => {
    expect(PHRASEBOOK.length).toBeGreaterThan(0);
    for (const entry of PHRASEBOOK) {
      expect(entry.reviewStatus).toBe('human-review-required');
      expect(entry.kk.trim().length).toBeGreaterThan(0);
      expect(entry.ru.trim().length).toBeGreaterThan(0);
      expect(entry.en.trim().length).toBeGreaterThan(0);
      expect(PHRASEBOOK_CATEGORIES).toContain(entry.category);
    }
  });

  it('groups at least one phrase into every advertised category', () => {
    for (const category of PHRASEBOOK_CATEGORIES) {
      expect(PHRASEBOOK.some((entry) => entry.category === category)).toBe(true);
    }
  });
});
