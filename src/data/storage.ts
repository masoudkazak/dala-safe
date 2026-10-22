export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const STORAGE_KEYS = {
  trips: 'dala-safe:v1:trips',
  settings: 'dala-safe:v1:settings',
  demo: 'dala-safe:v1:demo',
} as const;

export const STORAGE_VERSION = 1;

export interface StoredEnvelope<T> {
  version: number;
  savedAt: string;
  data: T;
}

export type WriteResult = { ok: true } | { ok: false; error: 'quota' | 'unavailable' };

export function createMemoryStorage(seed: Record<string, string> = {}): StorageLike {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

export function getBrowserStorage(): StorageLike {
  try {
    const probe = '__dala_safe_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return createMemoryStorage();
  }
}

export function readEnvelope<T>(
  storage: StorageLike,
  key: string,
  validate: (value: unknown) => value is T,
): { data: T | null; corrupted: boolean } {
  let raw: string | null = null;
  try {
    raw = storage.getItem(key);
  } catch {
    return { data: null, corrupted: false };
  }
  if (!raw) return { data: null, corrupted: false };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !('version' in parsed) || !('data' in parsed)) {
      quarantine(storage, key, raw);
      return { data: null, corrupted: true };
    }
    const envelope = parsed as unknown as StoredEnvelope<unknown>;
    const migrated = migrate(envelope);
    if (!validate(migrated)) {
      quarantine(storage, key, raw);
      return { data: null, corrupted: true };
    }
    return { data: migrated, corrupted: false };
  } catch {
    quarantine(storage, key, raw);
    return { data: null, corrupted: true };
  }
}

function migrate(envelope: StoredEnvelope<unknown>): unknown {
  if (envelope.version === STORAGE_VERSION) return envelope.data;
  return envelope.data;
}

function quarantine(storage: StorageLike, key: string, raw: string): void {
  try {
    storage.setItem(`${key}:corrupt:${Date.now()}`, raw);
  } catch {
    // Quarantine is best-effort; never block app start on a failed backup.
  }
}

export function writeEnvelope<T>(storage: StorageLike, key: string, data: T): WriteResult {
  const envelope: StoredEnvelope<T> = {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };
  try {
    storage.setItem(key, JSON.stringify(envelope));
    return { ok: true };
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return { ok: false, error: isQuota ? 'quota' : 'unavailable' };
  }
}

export function removeKey(storage: StorageLike, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore: callers surface a safe state when storage is unavailable.
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
