import { STORAGE_KEYS } from '@/constants/storage';
import { createChromeStore, type KeyValueStore } from '@/storage/chrome-store';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheFile {
  entries: Record<string, CacheEntry<unknown>>;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000;

export class CacheStore {
  constructor(private readonly store: KeyValueStore = createChromeStore('session')) {}

  async get<T>(key: string): Promise<T | undefined> {
    const file = await this.read();
    const entry = file.entries[key] as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      delete file.entries[key];
      await this.store.set(STORAGE_KEYS.cache, file);
      return undefined;
    }
    return entry.value;
  }

  async set<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
    const file = await this.read();
    file.entries[key] = { value, expiresAt: Date.now() + ttlMs };
    await this.store.set(STORAGE_KEYS.cache, file);
  }

  async clear(): Promise<void> {
    await this.store.set(STORAGE_KEYS.cache, { entries: {} });
  }

  private async read(): Promise<CacheFile> {
    return (await this.store.get<CacheFile>(STORAGE_KEYS.cache)) ?? { entries: {} };
  }
}
