import { describe, expect, it } from 'vitest';
import { createTrip } from '../../domain/trip';
import type { Trip } from '../../domain/types';
import { groupTrips, tripGroup } from './tripGroups';

const NOW = new Date('2026-06-15T12:00:00.000Z');

function tripWith(overrides: Partial<Trip>): Trip {
  const base = createTrip(
    {
      name: 'Trip',
      destination: 'Place',
      departureAt: '2026-06-16T08:00:00.000Z',
      returnAt: '2026-06-16T18:00:00.000Z',
      groupSize: 2,
    },
    NOW,
  );
  return { ...base, ...overrides };
}

describe('tripGroup', () => {
  it('classifies completed trips regardless of dates', () => {
    const trip = tripWith({ status: 'completed', departureAt: '2026-06-16T08:00:00.000Z' });
    expect(tripGroup(trip, NOW)).toBe('completed');
  });

  it('classifies future departures as upcoming', () => {
    expect(tripGroup(tripWith({ status: 'draft' }), NOW)).toBe('upcoming');
  });

  it('classifies trips between departure and return as active', () => {
    const trip = tripWith({
      status: 'ready',
      departureAt: '2026-06-15T08:00:00.000Z',
      returnAt: '2026-06-15T20:00:00.000Z',
    });
    expect(tripGroup(trip, NOW)).toBe('active');
  });

  it('keeps overdue non-completed trips in the active group', () => {
    const trip = tripWith({
      status: 'draft',
      departureAt: '2026-06-14T08:00:00.000Z',
      returnAt: '2026-06-14T20:00:00.000Z',
    });
    expect(tripGroup(trip, NOW)).toBe('active');
  });
});

describe('groupTrips', () => {
  it('partitions trips into the three groups', () => {
    const trips = [
      tripWith({ status: 'draft' }),
      tripWith({
        status: 'ready',
        departureAt: '2026-06-15T08:00:00.000Z',
        returnAt: '2026-06-15T20:00:00.000Z',
      }),
      tripWith({ status: 'completed' }),
    ];
    const groups = groupTrips(trips, NOW);
    expect(groups.upcoming).toHaveLength(1);
    expect(groups.active).toHaveLength(1);
    expect(groups.completed).toHaveLength(1);
  });
});
