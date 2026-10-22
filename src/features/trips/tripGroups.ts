import type { Trip } from '../../domain/types';

export type TripGroup = 'upcoming' | 'active' | 'completed';

export function tripGroup(trip: Trip, now: Date = new Date()): TripGroup {
  if (trip.status === 'completed') return 'completed';
  const departure = new Date(trip.departureAt);
  if (!Number.isNaN(departure.getTime()) && departure.getTime() > now.getTime()) return 'upcoming';
  return 'active';
}

export function groupTrips(trips: Trip[], now: Date = new Date()): Record<TripGroup, Trip[]> {
  const groups: Record<TripGroup, Trip[]> = { upcoming: [], active: [], completed: [] };
  for (const trip of trips) groups[tripGroup(trip, now)].push(trip);
  return groups;
}
