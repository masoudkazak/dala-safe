import { getBrowserStorage, removeKey, STORAGE_KEYS, type StorageLike } from '../../data/storage';

export function resetDemoStorage(storage: StorageLike = getBrowserStorage()): void {
  removeKey(storage, STORAGE_KEYS.demo);
}
