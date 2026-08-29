import { STORAGE_KEYS } from '@/constants/storage';
import type { ProviderId } from '@/constants/providers';
import type { Secrets } from '@/types/settings';
import { createChromeStore, type KeyValueStore } from '@/storage/chrome-store';

export class SecretStore {
  constructor(private readonly store: KeyValueStore = createChromeStore('local')) {}

  async getAll(): Promise<Secrets> {
    return (await this.store.get<Secrets>(STORAGE_KEYS.secrets)) ?? { apiKeys: {} };
  }

  async getKey(providerId: ProviderId): Promise<string> {
    const secrets = await this.getAll();
    return secrets.apiKeys[providerId] ?? '';
  }

  async setKey(providerId: ProviderId, apiKey: string): Promise<void> {
    const secrets = await this.getAll();
    if (apiKey) secrets.apiKeys[providerId] = apiKey;
    else delete secrets.apiKeys[providerId];
    await this.store.set(STORAGE_KEYS.secrets, secrets);
  }
}
