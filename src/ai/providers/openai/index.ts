import { ProviderId } from '@/constants/providers';
import type { AIProvider, ProviderRuntimeConfig } from '@/types/ai-provider';
import { OpenAICompatibleProvider } from '@/ai/openai-compatible';

export const meta = {
  id: ProviderId.OpenAI,
  name: 'OpenAI',
  needsApiKey: true,
  defaultBaseUrl: 'https://api.openai.com/v1',
};

class OpenAIProvider extends OpenAICompatibleProvider {
  constructor(config: ProviderRuntimeConfig) {
    super(config, {
      id: meta.id,
      name: meta.name,
      defaultModel: 'gpt-4.1-mini',
      models: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini', 'gpt-4o'],
    });
  }
}

export function createProvider(config: ProviderRuntimeConfig): AIProvider {
  return new OpenAIProvider(config);
}
