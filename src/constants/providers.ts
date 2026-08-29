export const ProviderId = {
  Mock: 'mock',
  OpenAI: 'openai',
  Gemini: 'gemini',
  Claude: 'claude',
  OpenRouter: 'openrouter',
  DeepSeek: 'deepseek',
  Ollama: 'ollama',
} as const;

export type ProviderId = (typeof ProviderId)[keyof typeof ProviderId];
