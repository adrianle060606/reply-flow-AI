import { SettingsStore } from '@/storage/settings-store';
import { SecretStore } from '@/storage/secret-store';
import { MemoryStore } from '@/storage/memory-store';
import { CacheStore } from '@/storage/cache-store';
import { createMessageRouter } from '@/background/router';
import { PlatformNotFoundError } from '@/utils/errors';

const app = {
  settings: new SettingsStore(),
  secrets: new SecretStore(),
  memory: new MemoryStore(),
  cache: new CacheStore(),
};

async function activeTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendToTab<T>(tabId: number, message: unknown): Promise<T> {
  return chrome.tabs.sendMessage(tabId, message) as Promise<T>;
}

const route = createMessageRouter(app, {
  async getConversation() {
    const tab = await activeTab();
    if (!tab?.id) throw new PlatformNotFoundError();
    const response = await sendToTab<{ ok: boolean; data?: unknown; error?: { message: string } }>(
      tab.id,
      { type: 'GET_CONVERSATION' },
    );
    if (!response?.ok) throw new PlatformNotFoundError();
    return response.data as never;
  },
  async insertReply(text: string) {
    const tab = await activeTab();
    if (!tab?.id) return false;
    const response = await sendToTab<{ ok: boolean; data?: { inserted?: boolean } }>(tab.id, {
      type: 'INSERT_REPLY',
      text,
    });
    return Boolean(response?.data?.inserted);
  },
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void route(message).then(sendResponse);
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }
});
