import { SettingsStore } from '@/storage/settings-store';
import { SecretStore } from '@/storage/secret-store';
import { MemoryStore } from '@/storage/memory-store';
import { CacheStore } from '@/storage/cache-store';
import { createMessageRouter } from '@/background/router';
import { SAMPLE_CONVERSATIONS } from '@/preview/sample-data';
import type { ConversationContext } from '@/types/conversation';
import type { ExtensionResponse } from '@/types/messages';

const THREAD_STORAGE_KEY = 'replyme.preview.thread';
const PREVIEW_RUNTIME_ID = 'preview';

type PreviewChrome = {
  runtime: {
    id: string;
    sendMessage: (message: unknown) => Promise<ExtensionResponse<unknown>>;
    openOptionsPage: () => void;
    lastError: undefined;
  };
  storage: undefined;
  tabs: {
    query: () => Promise<Array<{ id: number; url: string }>>;
  };
};

const state: { conversation: ConversationContext } = {
  conversation: conversationFromStore(),
};

export function previewConversation(): ConversationContext {
  return state.conversation;
}

export function setPreviewConversation(conversation: ConversationContext): void {
  state.conversation = conversation;
  persistThreadId(conversation.conversationId);
}

export function installPreviewRuntime(): void {
  if (globalThis.chrome?.runtime?.id && globalThis.chrome.runtime.id !== PREVIEW_RUNTIME_ID) {
    return;
  }

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

  const chromeMock: PreviewChrome = {
    runtime: {
      id: PREVIEW_RUNTIME_ID,
      sendMessage: async (message: unknown) => route(message),
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

  installChromeMock(chromeMock);
}

function conversationFromStore(): ConversationContext {
  return (
    SAMPLE_CONVERSATIONS.find((item) => item.conversationId === readStoredThreadId()) ??
    SAMPLE_CONVERSATIONS[0]!
  );
}

function readStoredThreadId(): string | null {
  if (typeof window === 'undefined') return null;
  const fromQuery = new URLSearchParams(window.location.search).get('thread');
  if (fromQuery) return fromQuery;
  try {
    return window.localStorage.getItem(THREAD_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistThreadId(id: string): void {
  try {
    window.localStorage.setItem(THREAD_STORAGE_KEY, id);
  } catch {
    /* quota / private mode */
  }
  const url = new URL(window.location.href);
  url.searchParams.set('thread', id);
  window.history.replaceState({}, '', url);
}

function installChromeMock(chromeMock: PreviewChrome): void {
  try {
    Object.defineProperty(globalThis, 'chrome', {
      configurable: true,
      writable: true,
      value: chromeMock,
    });
    return;
  } catch {
    /* Chrome pages expose a non-configurable chrome global. */
  }

  const existing = (globalThis as { chrome?: Record<string, unknown> }).chrome;
  if (!existing) {
    (globalThis as { chrome: unknown }).chrome = chromeMock;
    return;
  }

  try {
    existing.runtime = chromeMock.runtime;
    existing.tabs = chromeMock.tabs;
  } catch {
    const runtime = (existing.runtime ?? {}) as Record<string, unknown>;
    runtime.id = chromeMock.runtime.id;
    runtime.sendMessage = chromeMock.runtime.sendMessage;
    runtime.openOptionsPage = chromeMock.runtime.openOptionsPage;
    try {
      existing.runtime = runtime;
    } catch {
      Object.assign(runtime, chromeMock.runtime);
    }
  }
}
