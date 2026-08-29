import { STORAGE_KEYS } from '@/constants/storage';
import { mergeSettings } from '@/models/settings';
import type { Settings } from '@/types/settings';
import { createChromeStore, type KeyValueStore } from '@/storage/chrome-store';

export class SettingsStore {
  constructor(private readonly store: KeyValueStore = createChromeStore('sync')) {}

  async get(): Promise<Settings> {
    const stored = await this.store.get<Partial<Settings>>(STORAGE_KEYS.settings);
    return mergeSettings(stored);
  }

  async save(partial: Partial<Settings>): Promise<Settings> {
    const next = mergeSettings({ ...(await this.get()), ...partial });
    await this.store.set(STORAGE_KEYS.settings, next);
    return next;
  }
}
