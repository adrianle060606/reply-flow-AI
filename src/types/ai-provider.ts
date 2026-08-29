import type { ConversationContext } from '@/types/conversation';
import type { ReplyTone } from '@/constants/tones';

export interface GenerateReplyRequest {
  conversation: ConversationContext;
  tones: ReplyTone[];
  temperature: number;
  maxTokens: number;
  memorySummary?: string;
}

export interface GeneratedReply {
  id: string;
  tone: ReplyTone;
  text: string;
  provider: string;
  model: string;
}

export type RewriteAction =
  | 'grammar'
  | 'rewrite'
  | 'translate'
  | 'tone'
  | 'shorten'
  | 'expand'
  | 'explain';

export interface RewriteInstruction {
  action: RewriteAction;
  targetTone?: ReplyTone;
  targetLanguage?: string;
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly defaultModel: string;
  listModels(): string[];
  generateReply(request: GenerateReplyRequest): Promise<GeneratedReply[]>;
  summarize(conversation: ConversationContext): Promise<string>;
  rewrite(text: string, instruction: RewriteInstruction): Promise<string>;
}

export interface AIProviderModule {
  meta: {
    id: string;
    name: string;
    needsApiKey: boolean;
    defaultBaseUrl?: string;
  };
  createProvider(config: ProviderRuntimeConfig): AIProvider;
}

export interface ProviderRuntimeConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature: number;
}
