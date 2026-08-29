import type {
  AIProvider,
  GenerateReplyRequest,
  GeneratedReply,
  ProviderRuntimeConfig,
  RewriteInstruction,
} from '@/types/ai-provider';
import type { ConversationContext } from '@/types/conversation';
import { ProviderId } from '@/constants/providers';
import { REPLY_TONES, type ReplyTone } from '@/constants/tones';
import {
  generatePrompt,
  rewritePrompt,
  summarizePrompt,
  systemPreamble,
} from '@/ai/prompts';
import { extractJson } from '@/ai/json';
import { postJson } from '@/ai/http';
import { AppError } from '@/utils/errors';

export const meta = {
  id: ProviderId.Gemini,
  name: 'Gemini',
  needsApiKey: true,
  defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
};

class GeminiProvider implements AIProvider {
  readonly id = meta.id;
  readonly name = meta.name;
  readonly defaultModel = 'gemini-2.5-flash';

  constructor(private readonly config: ProviderRuntimeConfig) {}

  listModels(): string[] {
    return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
  }

  async generateReply(request: GenerateReplyRequest): Promise<GeneratedReply[]> {
    const raw = await this.complete(
      generatePrompt(request.conversation, request.tones, request.memorySummary),
      request.temperature,
      request.maxTokens,
    );
    const parsed = extractJson(raw) as { replies?: Array<{ tone?: string; text?: string }> };
    const replies = (parsed.replies ?? [])
      .filter((item) => item.text)
      .map((item, index) => ({
        id: `gemini-${index}-${item.tone}`,
        tone: (REPLY_TONES.find((tone) => tone === item.tone) ?? 'professional') as ReplyTone,
        text: String(item.text).trim(),
        provider: this.name,
        model: this.config.model || this.defaultModel,
      }));
    if (!replies.length) throw new AppError('PROVIDER_ERROR', 'Gemini returned no replies.');
    return replies;
  }

  async summarize(conversation: ConversationContext): Promise<string> {
    return (await this.complete(summarizePrompt(conversation), 0.3, 700)).trim();
  }

  async rewrite(text: string, instruction: RewriteInstruction): Promise<string> {
    return (await this.complete(rewritePrompt(text, instruction), 0.4, 800)).trim();
  }

  private async complete(prompt: string, temperature: number, maxTokens: number): Promise<string> {
    const model = this.config.model || this.defaultModel;
    const base = (this.config.baseUrl || meta.defaultBaseUrl).replace(/\/$/, '');
    const url = `${base}/models/${model}:generateContent?key=${encodeURIComponent(this.config.apiKey)}`;
    const payload = await postJson<{
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    }>(
      url,
      {
        systemInstruction: { parts: [{ text: systemPreamble() }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      },
      {},
    );
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    if (!text) throw new AppError('PROVIDER_ERROR', 'Gemini returned an empty completion.');
    return text;
  }
}

export function createProvider(config: ProviderRuntimeConfig): AIProvider {
  return new GeminiProvider(config);
}
