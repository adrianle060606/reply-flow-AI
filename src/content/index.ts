import { createAdapterForUrl } from '@/adapters/registry';
import { parseExtensionRequest } from '@/utils/validate-message';
import { PlatformNotFoundError } from '@/utils/errors';
import type { ExtensionResponse } from '@/types/messages';

function handle(raw: unknown): ExtensionResponse<unknown> {
  try {
    const request = parseExtensionRequest(raw);
    const adapter = createAdapterForUrl(location.href);
    if (!adapter) {
      throw new PlatformNotFoundError();
    }
    if (request.type === 'GET_CONVERSATION') {
      const conversation = adapter.detectConversation();
      if (!conversation) throw new PlatformNotFoundError();
      return { ok: true, data: conversation };
    }
    if (request.type === 'INSERT_REPLY') {
      return { ok: true, data: { inserted: undefined } };
    }
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'This message is not handled in the page.' } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read this page.';
    const code = error instanceof PlatformNotFoundError ? error.code : 'CONTENT_ERROR';
    return { ok: false, error: { code, message } };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const requestType = (message as { type?: string } | undefined)?.type;
  if (requestType !== 'GET_CONVERSATION' && requestType !== 'INSERT_REPLY') return;

  if (requestType === 'INSERT_REPLY') {
    const parsed = parseExtensionRequest(message);
    const adapter = createAdapterForUrl(location.href);
    void (async () => {
      if (!adapter || parsed.type !== 'INSERT_REPLY') {
        sendResponse({
          ok: false,
          error: { code: 'NO_CONVERSATION', message: 'No composer found on this page.' },
        });
        return;
      }
      const inserted = await adapter.insertReply(parsed.text);
      sendResponse({ ok: true, data: { inserted } });
    })();
    return true;
  }

  sendResponse(handle(message));
  return true;
});
