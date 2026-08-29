import {
  generateReplies,
  rewriteText,
  suggestFollowUps,
  suggestIcebreakers,
  summarizeConversation,
  type AppServices,
} from '@/services/copilot';
import { parseExtensionRequest } from '@/utils/validate-message';
import { AppError } from '@/utils/errors';
import { describeProviders } from '@/ai/registry';
import type { ProviderId } from '@/constants/providers';
import type { ExtensionRequest, ExtensionResponse } from '@/types/messages';
import type { ConversationContext } from '@/types/conversation';

export type ConversationBridge = {
  getConversation(): Promise<ConversationContext>;
  insertReply(text: string): Promise<boolean>;
};

export function createMessageRouter(app: AppServices, bridge: ConversationBridge) {
  return async function route(raw: unknown): Promise<ExtensionResponse<unknown>> {
    try {
      const request = parseExtensionRequest(raw);
      const data = await handle(request, app, bridge);
      return { ok: true, data };
    } catch (error) {
      const code = error instanceof AppError ? error.code : 'UNEXPECTED';
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      return { ok: false, error: { code, message } };
    }
  };
}

async function handle(
  request: ExtensionRequest,
  app: AppServices,
  bridge: ConversationBridge,
): Promise<unknown> {
  switch (request.type) {
    case 'PING':
      return { pong: true };
    case 'GET_CONVERSATION':
      return bridge.getConversation();
    case 'INSERT_REPLY':
      return { inserted: await bridge.insertReply(request.text) };
    case 'GENERATE_REPLIES':
      return generateReplies(app, request.conversation, request.tones);
    case 'SUMMARIZE':
      return { summary: await summarizeConversation(app, request.conversation) };
    case 'REWRITE':
      return { text: await rewriteText(app, request.text, request.instruction) };
    case 'FOLLOW_UPS':
      return { suggestions: await suggestFollowUps(app, request.conversation) };
    case 'ICEBREAKERS':
      return { suggestions: await suggestIcebreakers(app, request.conversation) };
    case 'GET_SETTINGS': {
      const settings = await app.settings.get();
      const secrets = await app.secrets.getAll();
      return {
        settings,
        hasKey: Object.fromEntries(
          Object.keys(secrets.apiKeys).map((id) => [id, Boolean(secrets.apiKeys[id as ProviderId])]),
        ),
      };
    }
    case 'SAVE_SETTINGS':
      return app.settings.save(request.settings);
    case 'SAVE_SECRET':
      await app.secrets.setKey(request.providerId as ProviderId, request.apiKey);
      return { saved: true };
    case 'GET_PROVIDERS':
      return describeProviders();
    case 'CLEAR_CACHE':
      await app.cache.clear();
      return { cleared: true };
    default: {
      const _never: never = request;
      return _never;
    }
  }
}
