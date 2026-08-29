import { ProviderId } from '@/constants/providers';
import type { AIProvider, ProviderRuntimeConfig } from '@/types/ai-provider';
import { OpenAICompatibleProvider } from '@/ai/openai-compatible';

export const meta = {
  id: ProviderId.DeepSeek,
  name: 'DeepSeek',
  needsApiKey: true,
  defaultBaseUrl: 'https://api.deepseek.com',
};

class DeepSeekProvider extends OpenAICompatibleProvider {
  constructor(config: ProviderRuntimeConfig) {
    super(
      { ...config, baseUrl: config.baseUrl || meta.defaultBaseUrl },
      {
        id: meta.id,
        name: meta.name,
        defaultModel: 'deepseek-chat',
        models: ['deepseek-chat', 'deepseek-reasoner'],
      },
    );
  }
}

export function createProvider(config: ProviderRuntimeConfig): AIProvider {
  return new DeepSeekProvider(config);
}
