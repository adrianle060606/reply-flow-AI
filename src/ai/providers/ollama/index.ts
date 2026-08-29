import { ProviderId } from '@/constants/providers';
import type { AIProvider, ProviderRuntimeConfig } from '@/types/ai-provider';
import { OpenAICompatibleProvider } from '@/ai/openai-compatible';

export const meta = {
  id: ProviderId.Ollama,
  name: 'Ollama (local)',
  needsApiKey: false,
  defaultBaseUrl: 'http://127.0.0.1:11434/v1',
};

class OllamaProvider extends OpenAICompatibleProvider {
  constructor(config: ProviderRuntimeConfig) {
    super(
      { ...config, apiKey: config.apiKey || 'ollama', baseUrl: config.baseUrl || meta.defaultBaseUrl },
      {
        id: meta.id,
        name: meta.name,
        defaultModel: 'llama3.1',
        models: ['llama3.1', 'qwen2.5', 'mistral'],
      },
    );
  }
}

export function createProvider(config: ProviderRuntimeConfig): AIProvider {
  return new OllamaProvider(config);
}
