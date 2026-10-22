import { useCallback, useEffect, useRef, useState } from 'react';

export const POOR_ACCURACY_THRESHOLD_METERS = 100;
export const DEFAULT_GEOLOCATION_TIMEOUT_MS = 15000;

export type GeolocationStatus =
  | 'prompt'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'timeout'
  | 'unavailable'
  | 'unsupported';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface GeolocationPositionLike {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  };
}

export interface GeolocationErrorLike {
  code?: number;
  message?: string;
}

export interface GeolocationProvider {
  getCurrentPosition(
    success: (position: GeolocationPositionLike) => void,
    error?: (error: GeolocationErrorLike) => void,
    options?: PositionOptions,
  ): void;
}

export interface UseGeolocationOptions {
  provider?: GeolocationProvider | null;
  timeoutMs?: number;
  maximumAgeMs?: number;
  poorAccuracyThreshold?: number;
}

export interface UseGeolocationResult {
  status: GeolocationStatus;
  position: GeolocationCoordinates | null;
  isPoorAccuracy: boolean;
  poorAccuracyThreshold: number;
  requestLocation: () => void;
  reset: () => void;
}

export function getBrowserGeolocation(): GeolocationProvider | null {
  try {
    if (typeof navigator === 'undefined') return null;
    const geolocation = navigator.geolocation;
    if (!geolocation || typeof geolocation.getCurrentPosition !== 'function') return null;
    return geolocation as unknown as GeolocationProvider;
  } catch {
    return null;
  }
}

function resolveProvider(provider: GeolocationProvider | null | undefined): GeolocationProvider | null {
  if (provider === null) return null;
  if (provider) return provider;
  return getBrowserGeolocation();
}

function mapError(error: GeolocationErrorLike | undefined): GeolocationStatus {
  if (error?.code === 1) return 'denied';
  if (error?.code === 3) return 'timeout';
  return 'unavailable';
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationResult {
  const { provider, timeoutMs = DEFAULT_GEOLOCATION_TIMEOUT_MS, maximumAgeMs = 0 } = options;
  const poorAccuracyThreshold = options.poorAccuracyThreshold ?? POOR_ACCURACY_THRESHOLD_METERS;

  const [status, setStatus] = useState<GeolocationStatus>(() =>
    resolveProvider(provider) ? 'prompt' : 'unsupported',
  );
  const [position, setPosition] = useState<GeolocationCoordinates | null>(null);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  const requestLocation = useCallback(() => {
    const currentProvider = resolveProvider(provider);
    if (!currentProvider) {
      setStatus('unsupported');
      setPosition(null);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const isCurrent = () => mountedRef.current && requestIdRef.current === requestId;

    setStatus('requesting');
    setPosition(null);

    try {
      currentProvider.getCurrentPosition(
        (result) => {
          if (!isCurrent()) return;
          const coords = result?.coords;
          const latitude = coords?.latitude;
          const longitude = coords?.longitude;
          const accuracy = coords?.accuracy;

          if (
            typeof latitude !== 'number' ||
            typeof longitude !== 'number' ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {
            setStatus('unavailable');
            setPosition(null);
            return;
          }

          setPosition({
            latitude,
            longitude,
            accuracy:
              typeof accuracy === 'number' && Number.isFinite(accuracy) ? Math.max(0, accuracy) : null,
          });
          setStatus('granted');
        },
        (error) => {
          if (!isCurrent()) return;
          setPosition(null);
          setStatus(mapError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: timeoutMs,
          maximumAge: maximumAgeMs,
        },
      );
    } catch {
      if (!isCurrent()) return;
      setPosition(null);
      setStatus('unavailable');
    }
  }, [maximumAgeMs, provider, timeoutMs]);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setPosition(null);
    setStatus(resolveProvider(provider) ? 'prompt' : 'unsupported');
  }, [provider]);

  const isPoorAccuracy =
    status === 'granted' &&
    position !== null &&
    position.accuracy !== null &&
    position.accuracy > poorAccuracyThreshold;

  return {
    status,
    position,
    isPoorAccuracy,
    poorAccuracyThreshold,
    requestLocation,
    reset,
  };
}
