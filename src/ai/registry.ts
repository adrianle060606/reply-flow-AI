import type { AIProvider, AIProviderModule, ProviderRuntimeConfig } from '@/types/ai-provider';
import { ProviderId } from '@/constants/providers';
import { MissingApiKeyError } from '@/utils/errors';

const modules = import.meta.glob<AIProviderModule>('./providers/*/index.ts', { eager: true });

export function allProviderModules(): AIProviderModule[] {
  return Object.values(modules).filter((mod) => Boolean(mod?.meta && mod.createProvider));
}

export function providerModule(id: string): AIProviderModule | undefined {
  return allProviderModules().find((mod) => mod.meta.id === id);
}

export function createConfiguredProvider(config: ProviderRuntimeConfig & { providerId: string }): AIProvider {
  const mod = providerModule(config.providerId) ?? providerModule(ProviderId.Mock);
  if (!mod) throw new Error('No AI providers registered.');
  if (mod.meta.needsApiKey && !config.apiKey) {
    throw new MissingApiKeyError(mod.meta.name);
  }
  return mod.createProvider({
    apiKey: config.apiKey,
    model: config.model,
    baseUrl: config.baseUrl || mod.meta.defaultBaseUrl,
    temperature: config.temperature,
  });
}

export function describeProviders() {
  return allProviderModules().map((mod) => ({
    id: mod.meta.id,
    name: mod.meta.name,
    needsApiKey: mod.meta.needsApiKey,
    models: (() => {
      try {
        return mod.createProvider({
          apiKey: 'preview',
          model: '',
          temperature: 0.7,
        }).listModels();
      } catch {
        return [];
      }
    })(),
  }));
}
