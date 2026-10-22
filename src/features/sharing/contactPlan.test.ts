import { describe, expect, it } from 'vitest';
import type { Trip } from '../../domain/types';
import { applyContactDetails, ensureSafetyPlan, withContactDetails } from './contactPlan';

const NOW = new Date('2026-05-10T06:30:00.000Z');

const BASE_TRIP: Trip = {
  id: 'trip-1',
  name: 'Trip',
  destination: 'Destination',
  departureAt: '2026-05-12T01:00:00.000Z',
  returnAt: '2026-05-12T12:00:00.000Z',
  groupSize: 2,
  notes: '',
  status: 'draft',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
  checklist: [],
  readiness: {
    durationHours: 5,
    groupExperience: 'some',
    connectivity: 'good',
    forecastAvailable: true,
    routeType: 'marked',
  },
  safetyPlan: null,
  track: null,
};

describe('ensureSafetyPlan', () => {
  it('creates a valid empty plan using trip readiness when no plan exists', () => {
    const plan = ensureSafetyPlan(BASE_TRIP, NOW);

    expect(plan.generatedAt).toBe(NOW.toISOString());
    expect(plan.answers).toEqual(BASE_TRIP.readiness);
    expect(plan.answers).not.toBe(BASE_TRIP.readiness);
    expect(plan.guidanceIds).toEqual([]);
    expect(plan.trustedContactName).toBe('');
    expect(plan.trustedContactPhone).toBe('');
    expect(plan.meetingPoint).toBe('');
    expect(plan.notes).toBe('');
  });

  it('returns an existing plan unchanged', () => {
    const existing = {
      ...ensureSafetyPlan(BASE_TRIP, NOW),
      trustedContactName: 'Aigerim',
      notes: 'Keep the plan',
    };
    const trip = { ...BASE_TRIP, safetyPlan: existing };

    expect(ensureSafetyPlan(trip, NOW)).toBe(existing);
  });
});

describe('applyContactDetails', () => {
  it('updates contact fields while preserving other safety-plan fields', () => {
    const base = {
      ...ensureSafetyPlan(BASE_TRIP, NOW),
      guidanceIds: ['water'],
      notes: 'Call before leaving',
    };

    const next = applyContactDetails(base, {
      trustedContactName: '  Aigerim ',
      trustedContactPhone: ' +7 700 123 45 67 ',
      meetingPoint: ' Trailhead parking ',
    });

    expect(next.trustedContactName).toBe('Aigerim');
    expect(next.trustedContactPhone).toBe('+7 700 123 45 67');
    expect(next.meetingPoint).toBe('Trailhead parking');
    expect(next.guidanceIds).toEqual(['water']);
    expect(next.notes).toBe('Call before leaving');
    expect(next.generatedAt).toBe(base.generatedAt);
  });

  it('creates and applies a plan without mutating the trip', () => {
    const next = withContactDetails(
      BASE_TRIP,
      { trustedContactName: 'Aigerim', trustedContactPhone: '123', meetingPoint: 'Parking' },
      NOW,
    );

    expect(next.safetyPlan?.trustedContactName).toBe('Aigerim');
    expect(next.safetyPlan?.answers).toEqual(BASE_TRIP.readiness);
    expect(next.safetyPlan?.guidanceIds).toEqual([]);
    expect(BASE_TRIP.safetyPlan).toBeNull();
  });
});
