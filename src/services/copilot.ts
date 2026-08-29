import type { AIProvider } from '@/types/ai-provider';
import type { ConversationContext } from '@/types/conversation';
import type { ReplyTone } from '@/constants/tones';
import type { Settings } from '@/types/settings';
import type { ProviderId } from '@/constants/providers';
import { createConfiguredProvider } from '@/ai/registry';
import { tokensForLength } from '@/models/settings';
import { conversationFingerprint } from '@/models/conversation';
import { sha256 } from '@/utils/hash';
import { RateLimiter } from '@/utils/rate-limiter';
import { RateLimitedError } from '@/utils/errors';
import type { CacheStore } from '@/storage/cache-store';
import type { MemoryStore } from '@/storage/memory-store';
import type { SecretStore } from '@/storage/secret-store';
import type { SettingsStore } from '@/storage/settings-store';

export interface AppServices {
  settings: SettingsStore;
  secrets: SecretStore;
  memory: MemoryStore;
  cache: CacheStore;
}

export function createProviderFromStores(
  settings: Settings,
  apiKey: string,
): AIProvider {
  return createConfiguredProvider({
    providerId: settings.providerId,
    apiKey,
    model: settings.model,
    baseUrl: settings.baseUrl,
    temperature: settings.temperature,
  });
}

const limiter = new RateLimiter(20, 60_000);

export async function generateReplies(
  app: AppServices,
  conversation: ConversationContext,
  tones: ReplyTone[],
) {
  const settings = await app.settings.get();
  const apiKey = await app.secrets.getKey(settings.providerId as ProviderId);
  const provider = createProviderFromStores(settings, apiKey);
  const memory = await app.memory.get(conversation.conversationId);
  const cacheKey = await sha256(
    JSON.stringify({
      fp: conversationFingerprint(conversation),
      tones,
      model: settings.model,
      provider: settings.providerId,
      temperature: settings.temperature,
      length: settings.responseLength,
      memory,
    }),
  );
  const cached = await app.cache.get<Awaited<ReturnType<AIProvider['generateReply']>>>(cacheKey);
  if (cached) return cached;

  const gate = limiter.tryConsume();
  if (!gate.allowed) throw new RateLimitedError(gate.retryAfterMs);

  const replies = await provider.generateReply({
    conversation,
    tones,
    temperature: settings.temperature,
    maxTokens: tokensForLength(settings.responseLength),
    memorySummary: memory,
  });
  await app.cache.set(cacheKey, replies);
  return replies;
}

export async function summarizeConversation(
  app: AppServices,
  conversation: ConversationContext,
) {
  const settings = await app.settings.get();
  const apiKey = await app.secrets.getKey(settings.providerId as ProviderId);
  const provider = createProviderFromStores(settings, apiKey);
  const summary = await provider.summarize(conversation);
  await app.memory.put(conversation.conversationId, summary);
  return summary;
}

export async function rewriteText(
  app: AppServices,
  text: string,
  instruction: Parameters<AIProvider['rewrite']>[1],
) {
  const settings = await app.settings.get();
  const apiKey = await app.secrets.getKey(settings.providerId as ProviderId);
  const provider = createProviderFromStores(settings, apiKey);
  return provider.rewrite(text, instruction);
}

type SuggestionCapable = AIProvider & {
  suggestFollowUps?: (conversation: ConversationContext) => Promise<string[]>;
  suggestIcebreakers?: (conversation: ConversationContext) => Promise<string[]>;
};

export async function suggestFollowUps(app: AppServices, conversation: ConversationContext) {
  const provider = (await providerFrom(app)) as SuggestionCapable;
  if (provider.suggestFollowUps) return provider.suggestFollowUps(conversation);
  const rewritten = await provider.rewrite(conversation.messages.at(-1)?.body ?? '', {
    action: 'rewrite',
  });
  return [rewritten];
}

export async function suggestIcebreakers(app: AppServices, conversation: ConversationContext) {
  const provider = (await providerFrom(app)) as SuggestionCapable;
  if (provider.suggestIcebreakers) return provider.suggestIcebreakers(conversation);
  return provider.rewrite(`Icebreaker for ${conversation.title}`, { action: 'rewrite' }).then((text) => [text]);
}

async function providerFrom(app: AppServices): Promise<AIProvider> {
  const settings = await app.settings.get();
  const apiKey = await app.secrets.getKey(settings.providerId as ProviderId);
  return createProviderFromStores(settings, apiKey);
}
