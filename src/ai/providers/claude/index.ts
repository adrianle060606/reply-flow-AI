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
  id: ProviderId.Claude,
  name: 'Claude',
  needsApiKey: true,
  defaultBaseUrl: 'https://api.anthropic.com',
};

class ClaudeProvider implements AIProvider {
  readonly id = meta.id;
  readonly name = meta.name;
  readonly defaultModel = 'claude-sonnet-4-20250514';

  constructor(private readonly config: ProviderRuntimeConfig) {}

  listModels(): string[] {
    return ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-5-haiku-latest'];
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
        id: `claude-${index}-${item.tone}`,
        tone: (REPLY_TONES.find((tone) => tone === item.tone) ?? 'professional') as ReplyTone,
        text: String(item.text).trim(),
        provider: this.name,
        model: this.config.model || this.defaultModel,
      }));
    if (!replies.length) throw new AppError('PROVIDER_ERROR', 'Claude returned no replies.');
    return replies;
  }

  async summarize(conversation: ConversationContext): Promise<string> {
    return (await this.complete(summarizePrompt(conversation), 0.3, 700)).trim();
  }

  async rewrite(text: string, instruction: RewriteInstruction): Promise<string> {
    return (await this.complete(rewritePrompt(text, instruction), 0.4, 800)).trim();
  }

  private async complete(prompt: string, temperature: number, maxTokens: number): Promise<string> {
    const base = (this.config.baseUrl || meta.defaultBaseUrl).replace(/\/$/, '');
    const payload = await postJson<{ content?: Array<{ type?: string; text?: string }> }>(
      `${base}/v1/messages`,
      {
        model: this.config.model || this.defaultModel,
        max_tokens: maxTokens,
        temperature,
        system: systemPreamble(),
        messages: [{ role: 'user', content: prompt }],
      },
      {
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
    );
    const text = payload.content?.filter((block) => block.type === 'text').map((block) => block.text ?? '').join('') ?? '';
    if (!text) throw new AppError('PROVIDER_ERROR', 'Claude returned an empty completion.');
    return text;
  }
}

export function createProvider(config: ProviderRuntimeConfig): AIProvider {
  return new ClaudeProvider(config);
}
