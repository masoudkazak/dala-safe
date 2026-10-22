import type { GeolocationCoordinates } from './useGeolocation';

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

export function formatCoordinates(
  position: Pick<GeolocationCoordinates, 'latitude' | 'longitude'>,
  digits = 5,
): string {
  return `${position.latitude.toFixed(digits)}, ${position.longitude.toFixed(digits)}`;
}

export function telHref(number: string): string {
  const normalized = number.replace(/[^\d+]/g, '');
  return `tel:${normalized}`;
}

export function sourceHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function legacyCopyText(text: string): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.focus();
    area.select();
    const copied = typeof document.execCommand === 'function' && document.execCommand('copy');
    document.body.removeChild(area);
    return Boolean(copied);
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined') {
    const clipboard = navigator.clipboard;
    if (clipboard && typeof clipboard.writeText === 'function') {
      try {
        await clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to the legacy copy path.
      }
    }
  }

  return legacyCopyText(text);
}

export async function shareCoordinates(text: string, title: string): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      if (isAbortLike(error)) return 'cancelled';
      // Fall through to copy when the native share sheet fails.
    }
  }

  return (await copyText(text)) ? 'copied' : 'failed';
}

function isAbortLike(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}
