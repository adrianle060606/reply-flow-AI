import type {
  AIProvider,
  GenerateReplyRequest,
  GeneratedReply,
  ProviderRuntimeConfig,
  RewriteInstruction,
} from '@/types/ai-provider';
import type { ConversationContext } from '@/types/conversation';
import { REPLY_TONES, type ReplyTone } from '@/constants/tones';
import {
  followUpPrompt,
  generatePrompt,
  icebreakerPrompt,
  rewritePrompt,
  summarizePrompt,
  systemPreamble,
} from '@/ai/prompts';
import { asStringArray, extractJson } from '@/ai/json';
import { assistantTextFromOpenAI, postJson } from '@/ai/http';
import { AppError } from '@/utils/errors';

interface OpenAICompatOptions {
  id: string;
  name: string;
  defaultModel: string;
  models: string[];
  completionsPath?: string;
}

export abstract class OpenAICompatibleProvider implements AIProvider {
  readonly id: string;
  readonly name: string;
  readonly defaultModel: string;
  private readonly models: string[];
  private readonly completionsPath: string;

  constructor(
    protected readonly config: ProviderRuntimeConfig,
    options: OpenAICompatOptions,
  ) {
    this.id = options.id;
    this.name = options.name;
    this.defaultModel = options.defaultModel;
    this.models = options.models;
    this.completionsPath = options.completionsPath ?? '/chat/completions';
  }

  listModels(): string[] {
    return this.models;
  }

  async generateReply(request: GenerateReplyRequest): Promise<GeneratedReply[]> {
    const raw = await this.complete(
      generatePrompt(request.conversation, request.tones, request.memorySummary),
      request.temperature,
      request.maxTokens,
      true,
    );
    const parsed = extractJson(raw) as { replies?: Array<{ tone?: string; text?: string }> };
    const replies = (parsed.replies ?? [])
      .filter((item) => item.text)
      .map((item, index) => ({
        id: `${this.id}-${index}-${item.tone}`,
        tone: normalizeTone(item.tone),
        text: String(item.text).trim(),
        provider: this.name,
        model: this.config.model || this.defaultModel,
      }));
    if (replies.length === 0) {
      throw new AppError('PROVIDER_ERROR', 'The provider did not return any replies.');
    }
    return replies;
  }

  async summarize(conversation: ConversationContext): Promise<string> {
    return (await this.complete(summarizePrompt(conversation), 0.3, 700, false)).trim();
  }

  async rewrite(text: string, instruction: RewriteInstruction): Promise<string> {
    return (await this.complete(rewritePrompt(text, instruction), 0.4, 800, false)).trim();
  }

  async suggestFollowUps(conversation: ConversationContext): Promise<string[]> {
    const raw = await this.complete(followUpPrompt(conversation), 0.7, 400, true);
    return asStringArray(extractJson(raw), 'suggestions').slice(0, 5);
  }

  async suggestIcebreakers(conversation: ConversationContext): Promise<string[]> {
    const raw = await this.complete(icebreakerPrompt(conversation), 0.8, 400, true);
    return asStringArray(extractJson(raw), 'suggestions').slice(0, 5);
  }

  protected headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.config.apiKey}` };
  }

  protected endpoint(): string {
    const base = (this.config.baseUrl || this.defaultBaseUrl()).replace(/\/$/, '');
    return `${base}${this.completionsPath}`;
  }

  protected defaultBaseUrl(): string {
    return 'https://api.openai.com/v1';
  }

  private async complete(
    user: string,
    temperature: number,
    maxTokens: number,
    json: boolean,
  ): Promise<string> {
    const payload = await postJson<{
      choices?: Array<{ message?: { content?: string } }>;
    }>(
      this.endpoint(),
      {
        model: this.config.model || this.defaultModel,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPreamble() },
          { role: 'user', content: user },
        ],
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      },
      this.headers(),
    );
    return assistantTextFromOpenAI(payload);
  }
}

function normalizeTone(value: string | undefined): ReplyTone {
  const match = REPLY_TONES.find((tone) => tone === value);
  return match ?? 'professional';
}
