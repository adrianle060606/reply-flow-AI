import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { REPLY_TONES, TONE_COPY } from '@/constants/tones';
import { DEFAULT_SHORTCUT, MAC_SHORTCUT } from '@/constants/storage';
import type { ProviderId } from '@/constants/providers';
import type { ResponseLength, ThemePreference } from '@/types/settings';

export function OptionsApp() {
  const { settings, hasKey, providers, loading, error, save, saveKey } = useSettings();
  useTheme(settings.theme);
  const [apiKey, setApiKey] = useState('');
  const active = providers.find((item) => item.id === settings.providerId);

  async function persistKey() {
    await saveKey(settings.providerId as ProviderId, apiKey.trim());
    setApiKey('');
    toast.success('API key stored in chrome.storage.local');
  }

  return (
    <div className="reply-shell min-h-screen px-4 py-10 text-zinc-900 dark:text-zinc-50">
      <Toaster position="top-center" richColors />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Header />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Keys stay in local Chrome storage. The service worker is the only process that reads them.
          </p>
        </div>
        {error ? <ErrorBanner message={error} /> : null}
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : null}

        <Card className="space-y-4">
          <h2 className="text-sm font-semibold">AI provider</h2>
          <Select
            value={settings.providerId}
            onChange={(event) => {
              const providerId = event.target.value as ProviderId;
              const next = providers.find((item) => item.id === providerId);
              void save({ providerId, model: next?.models[0] ?? settings.model });
            }}
          >
            {providers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select
            value={settings.model}
            onChange={(event) => void save({ model: event.target.value })}
          >
            {(active?.models ?? [settings.model]).map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Select>
          {active?.needsApiKey ? (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={hasKey[settings.providerId] ? 'Key saved — paste to replace' : 'API key'}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                autoComplete="off"
              />
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{hasKey[settings.providerId] ? 'A key is stored for this provider.' : 'No key stored yet.'}</span>
                <Button size="sm" disabled={!apiKey.trim()} onClick={() => void persistKey()}>
                  Save key
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              This provider does not need a key. Mock is for demos; Ollama talks to a local daemon.
            </p>
          )}
          <Input
            placeholder="Optional base URL override"
            value={settings.baseUrl}
            onChange={(event) => void save({ baseUrl: event.target.value })}
          />
        </Card>

        <Card className="space-y-4">
          <h2 className="text-sm font-semibold">Generation</h2>
          <label className="block text-xs text-zinc-500">
            Temperature · {settings.temperature.toFixed(1)}
          </label>
          <Slider
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature}
            onChange={(event) => void save({ temperature: Number(event.target.value) })}
          />
          <Select
            value={settings.responseLength}
            onChange={(event) => void save({ responseLength: event.target.value as ResponseLength })}
          >
            <option value="short">Short replies</option>
            <option value="medium">Medium replies</option>
            <option value="long">Long replies</option>
          </Select>
          <Select
            value={settings.defaultTone}
            onChange={(event) => void save({ defaultTone: event.target.value as (typeof REPLY_TONES)[number] })}
          >
            {REPLY_TONES.map((tone) => (
              <option key={tone} value={tone}>
                Default tone · {TONE_COPY[tone].label}
              </option>
            ))}
          </Select>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-sm font-semibold">Appearance & shortcut</h2>
          <Select
            value={settings.theme}
            onChange={(event) => void save({ theme: event.target.value as ThemePreference })}
          >
            <option value="system">Theme · System</option>
            <option value="light">Theme · Light</option>
            <option value="dark">Theme · Dark</option>
          </Select>
          <div className="rounded-xl bg-zinc-950/5 px-3 py-3 dark:bg-white/5">
            <p className="text-sm font-medium">Open ReplyMe</p>
            <p className="mt-1 text-xs text-zinc-500">
              Default <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] dark:bg-zinc-800">{DEFAULT_SHORTCUT}</kbd>
              {' '}(<kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] dark:bg-zinc-800">{MAC_SHORTCUT}</kbd> on macOS).
              Remap in <span className="font-mono">chrome://extensions/shortcuts</span>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
