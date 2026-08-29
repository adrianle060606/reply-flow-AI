import { SettingsStore } from '@/storage/settings-store';
import { SecretStore } from '@/storage/secret-store';
import { MemoryStore } from '@/storage/memory-store';
import { CacheStore } from '@/storage/cache-store';
import { createMessageRouter } from '@/background/router';
import { SAMPLE_CONVERSATIONS } from '@/preview/sample-data';
import type { ConversationContext } from '@/types/conversation';
import type { ExtensionResponse } from '@/types/messages';

const state: { conversation: ConversationContext } = {
  conversation: SAMPLE_CONVERSATIONS[0]!,
};

export function previewConversation(): ConversationContext {
  return state.conversation;
}

export function setPreviewConversation(conversation: ConversationContext): void {
  state.conversation = conversation;
}

export function installPreviewRuntime(): void {
  if (globalThis.chrome?.runtime?.id) return;

  const app = {
    settings: new SettingsStore(),
    secrets: new SecretStore(),
    memory: new MemoryStore(),
    cache: new CacheStore(),
  };

  const route = createMessageRouter(app, {
    async getConversation() {
      return state.conversation;
    },
    async insertReply() {
      return true;
    },
  });

  const chromeMock = {
    runtime: {
      id: 'preview',
      sendMessage: async (message: unknown) => route(message) as Promise<ExtensionResponse<unknown>>,
      openOptionsPage: () => {
        window.location.href = '/options.html';
      },
      lastError: undefined,
    },
    storage: undefined,
    tabs: {
      query: async () => [{ id: 1, url: state.conversation.url }],
    },
  };

  Object.defineProperty(globalThis, 'chrome', {
    configurable: true,
    value: chromeMock,
  });
}
