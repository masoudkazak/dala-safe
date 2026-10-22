import { describe, expect, it } from 'vitest';
import { validateTripInput } from '../../domain/trip';
import type { TripInput } from '../../domain/types';

const NOW = new Date('2026-06-15T09:00:00.000Z');

function input(overrides: Partial<TripInput> = {}): TripInput {
  return {
    name: 'Big Almaty Lake hike',
    destination: 'Big Almaty Lake',
    departureAt: '2026-06-16T06:00:00.000Z',
    returnAt: '2026-06-16T14:00:00.000Z',
    groupSize: 3,
    ...overrides,
  };
}

describe('validateTripInput', () => {
  it('accepts a valid trip', () => {
    expect(validateTripInput(input(), NOW)).toEqual([]);
  });

  it('requires name and destination', () => {
    const issues = validateTripInput(input({ name: '   ', destination: '' }), NOW);
    expect(issues).toContainEqual({ field: 'name', code: 'required' });
    expect(issues).toContainEqual({ field: 'destination', code: 'required' });
  });

  it('flags unparseable dates as invalid', () => {
    const issues = validateTripInput(input({ departureAt: '', returnAt: 'not-a-date' }), NOW);
    expect(issues).toContainEqual({ field: 'departureAt', code: 'invalid' });
    expect(issues).toContainEqual({ field: 'returnAt', code: 'invalid' });
  });

  it('flags return at or before departure', () => {
    const equal = validateTripInput(input({ returnAt: '2026-06-16T06:00:00.000Z' }), NOW);
    expect(equal).toContainEqual({ field: 'returnAt', code: 'return-before-departure' });

    const before = validateTripInput(input({ returnAt: '2026-06-16T05:00:00.000Z' }), NOW);
    expect(before).toContainEqual({ field: 'returnAt', code: 'return-before-departure' });
  });

  it('flags departure more than a day in the past but allows up to a day', () => {
    const past = validateTripInput(
      input({ departureAt: '2026-06-13T06:00:00.000Z', returnAt: '2026-06-13T14:00:00.000Z' }),
      NOW,
    );
    expect(past).toContainEqual({ field: 'departureAt', code: 'departure-in-past' });

    const recent = validateTripInput(
      input({ departureAt: '2026-06-14T10:00:00.000Z', returnAt: '2026-06-14T18:00:00.000Z' }),
      NOW,
    );
    expect(recent.filter((issue) => issue.code === 'departure-in-past')).toEqual([]);
  });

  it('validates group size bounds and integrality', () => {
    for (const groupSize of [0, 51, 2.5, Number.NaN]) {
      const issues = validateTripInput(input({ groupSize }), NOW);
      expect(issues).toContainEqual({ field: 'groupSize', code: 'group-size-range' });
    }
    expect(validateTripInput(input({ groupSize: 1 }), NOW)).toEqual([]);
    expect(validateTripInput(input({ groupSize: 50 }), NOW)).toEqual([]);
  });
});
