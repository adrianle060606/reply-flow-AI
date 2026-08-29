import { useCallback, useEffect, useState } from 'react';
import { sendMessage } from '@/hooks/runtime';
import { DEFAULT_SETTINGS } from '@/models/settings';
import type { Settings } from '@/types/settings';
import type { ProviderId } from '@/constants/providers';

interface ProvidersPayload {
  id: string;
  name: string;
  needsApiKey: boolean;
  models: string[];
}

interface SettingsPayload {
  settings: Settings;
  hasKey: Record<string, boolean>;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hasKey, setHasKey] = useState<Record<string, boolean>>({});
  const [providers, setProviders] = useState<ProvidersPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [payload, catalog] = await Promise.all([
        sendMessage<SettingsPayload>({ type: 'GET_SETTINGS' }),
        sendMessage<ProvidersPayload[]>({ type: 'GET_PROVIDERS' }),
      ]);
      setSettings(payload.settings);
      setHasKey(payload.hasKey);
      setProviders(catalog);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (partial: Partial<Settings>) => {
    const next = await sendMessage<Settings>({ type: 'SAVE_SETTINGS', settings: partial });
    setSettings(next);
    return next;
  }, []);

  const saveKey = useCallback(async (providerId: ProviderId, apiKey: string) => {
    await sendMessage({ type: 'SAVE_SECRET', providerId, apiKey });
    setHasKey((current) => ({ ...current, [providerId]: apiKey.length > 0 }));
  }, []);

  return { settings, hasKey, providers, loading, error, refresh, save, saveKey };
}
