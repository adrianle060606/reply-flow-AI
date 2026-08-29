import { ProviderId } from '@/constants/providers';
import type { AIProvider, ProviderRuntimeConfig } from '@/types/ai-provider';
import { OpenAICompatibleProvider } from '@/ai/openai-compatible';

export const meta = {
  id: ProviderId.OpenRouter,
  name: 'OpenRouter',
  needsApiKey: true,
  defaultBaseUrl: 'https://openrouter.ai/api/v1',
};

class OpenRouterProvider extends OpenAICompatibleProvider {
  constructor(config: ProviderRuntimeConfig) {
    super(
      { ...config, baseUrl: config.baseUrl || meta.defaultBaseUrl },
      {
        id: meta.id,
        name: meta.name,
        defaultModel: 'openai/gpt-4.1-mini',
        models: [
          'openai/gpt-4.1-mini',
          'anthropic/claude-sonnet-4',
          'google/gemini-2.5-flash',
        ],
      },
    );
  }

  protected headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      'HTTP-Referer': 'https://replyme.local',
      'X-Title': 'ReplyMe',
    };
  }
}

export function createProvider(config: ProviderRuntimeConfig): AIProvider {
  return new OpenRouterProvider(config);
}
