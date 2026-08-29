export type StorageAreaName = 'local' | 'sync' | 'session';

export interface KeyValueStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

function memoryFallback(): Map<string, unknown> {
  const g = globalThis as unknown as { __replymeMemory?: Map<string, unknown> };
  if (!g.__replymeMemory) g.__replymeMemory = new Map();
  return g.__replymeMemory;
}

export function createChromeStore(area: StorageAreaName): KeyValueStore {
  const chromeArea = globalThis.chrome?.storage?.[area];
  if (chromeArea) {
    return {
      async get<T>(key: string) {
        const result = await chromeArea.get(key);
        return result[key] as T | undefined;
      },
      async set<T>(key: string, value: T) {
        await chromeArea.set({ [key]: value });
      },
      async remove(key: string) {
        await chromeArea.remove(key);
      },
    };
  }

  const prefix = `replyme:${area}:`;
  return {
    async get<T>(key: string) {
      try {
        const raw = globalThis.localStorage?.getItem(prefix + key);
        if (raw) return JSON.parse(raw) as T;
      } catch {
        /* ignore */
      }
      return memoryFallback().get(prefix + key) as T | undefined;
    },
    async set<T>(key: string, value: T) {
      memoryFallback().set(prefix + key, value);
      try {
        globalThis.localStorage?.setItem(prefix + key, JSON.stringify(value));
      } catch {
        /* ignore quota */
      }
    },
    async remove(key: string) {
      memoryFallback().delete(prefix + key);
      try {
        globalThis.localStorage?.removeItem(prefix + key);
      } catch {
        /* ignore */
      }
    },
  };
}
