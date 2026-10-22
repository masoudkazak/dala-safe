import type { SafetyPlan, Trip } from '../../domain/types';

export interface ContactDetails {
  trustedContactName: string;
  trustedContactPhone: string;
  meetingPoint: string;
}

export function ensureSafetyPlan(trip: Trip, now: Date = new Date()): SafetyPlan {
  if (trip.safetyPlan) return trip.safetyPlan;
  return {
    generatedAt: now.toISOString(),
    answers: { ...trip.readiness },
    guidanceIds: [],
    trustedContactName: '',
    trustedContactPhone: '',
    meetingPoint: '',
    notes: '',
  };
}

export function applyContactDetails(plan: SafetyPlan, details: ContactDetails): SafetyPlan {
  return {
    ...plan,
    trustedContactName: details.trustedContactName.trim(),
    trustedContactPhone: details.trustedContactPhone.trim(),
    meetingPoint: details.meetingPoint.trim(),
  };
}

export function withContactDetails(trip: Trip, details: ContactDetails, now: Date = new Date()): Trip {
  return {
    ...trip,
    safetyPlan: applyContactDetails(ensureSafetyPlan(trip, now), details),
  };
}
