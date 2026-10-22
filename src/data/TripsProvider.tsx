import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getBrowserStorage } from './storage';
import { loadTrips, removeTrip, saveTrips, upsertTrip } from './tripRepository';
import { createTrip as buildTrip, duplicateTrip as buildDuplicate } from '../domain/trip';
import type { Trip, TripInput, TripStatus } from '../domain/types';

const storage = getBrowserStorage();

export type StorageProblem = 'quota' | 'unavailable' | 'corrupted' | null;

export interface TripsContextValue {
  trips: Trip[];
  getTrip: (id: string) => Trip | undefined;
  createTrip: (input: TripInput) => Trip | null;
  updateTrip: (id: string, updater: (trip: Trip) => Trip) => void;
  patchTrip: (id: string, patch: Partial<Omit<Trip, 'id' | 'createdAt'>>) => void;
  setStatus: (id: string, status: TripStatus) => void;
  duplicateTrip: (id: string) => Trip | null;
  deleteTrip: (id: string) => void;
  replaceAll: (trips: Trip[]) => void;
  storageProblem: StorageProblem;
  clearStorageProblem: () => void;
}

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadTrips(storage));
  const [trips, setTrips] = useState<Trip[]>(initial.trips);
  const [storageProblem, setStorageProblem] = useState<StorageProblem>(initial.corrupted ? 'corrupted' : null);

  const persist = useCallback((next: Trip[]) => {
    const result = saveTrips(storage, next);
    if (!result.ok) setStorageProblem(result.error);
  }, []);

  const commit = useCallback(
    (next: Trip[]) => {
      setTrips(next);
      persist(next);
    },
    [persist],
  );

  const getTrip = useCallback((id: string) => trips.find((trip) => trip.id === id), [trips]);

  const updateTrip = useCallback(
    (id: string, updater: (trip: Trip) => Trip) => {
      setTrips((current) => {
        const existing = current.find((trip) => trip.id === id);
        if (!existing) return current;
        const updated = { ...updater(existing), updatedAt: new Date().toISOString() };
        const next = upsertTrip(current, updated);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const createTrip = useCallback(
    (input: TripInput) => {
      const trip = buildTrip(input);
      commit([trip, ...trips]);
      return trip;
    },
    [commit, trips],
  );

  const patchTrip = useCallback(
    (id: string, patch: Partial<Omit<Trip, 'id' | 'createdAt'>>) => {
      updateTrip(id, (trip) => ({ ...trip, ...patch }));
    },
    [updateTrip],
  );

  const setStatus = useCallback(
    (id: string, status: TripStatus) => {
      patchTrip(id, { status });
    },
    [patchTrip],
  );

  const duplicateTrip = useCallback(
    (id: string) => {
      const source = trips.find((trip) => trip.id === id);
      if (!source) return null;
      const copy = buildDuplicate(source);
      commit([copy, ...trips]);
      return copy;
    },
    [commit, trips],
  );

  const deleteTrip = useCallback(
    (id: string) => {
      commit(removeTrip(trips, id));
    },
    [commit, trips],
  );

  const replaceAll = useCallback(
    (next: Trip[]) => {
      commit(next);
    },
    [commit],
  );

  const value = useMemo<TripsContextValue>(
    () => ({
      trips,
      getTrip,
      createTrip,
      updateTrip,
      patchTrip,
      setStatus,
      duplicateTrip,
      deleteTrip,
      replaceAll,
      storageProblem,
      clearStorageProblem: () => setStorageProblem(null),
    }),
    [trips, getTrip, createTrip, updateTrip, patchTrip, setStatus, duplicateTrip, deleteTrip, replaceAll, storageProblem],
  );

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTrips(): TripsContextValue {
  const context = useContext(TripsContext);
  if (!context) throw new Error('useTrips must be used inside TripsProvider');
  return context;
}

export function useTrip(id: string | undefined): Trip | undefined {
  const { getTrip } = useTrips();
  return id ? getTrip(id) : undefined;
}
