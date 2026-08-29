import type { ConversationContext } from '@/types/conversation';
import type { ChatMessageFromPlatform } from '@/types/messaging-platform';
import { BasePlatformAdapter } from '@/adapters/shared/base-adapter';
import { firstText, qsa, qs } from '@/adapters/shared/dom';
import meta from './meta.json';

export class MessengerAdapter extends BasePlatformAdapter {
  readonly id = meta.id;
  readonly name = meta.name;

  detectConversation(): ConversationContext | null {
    const root = this.conversationRoot();
    if (!root) return null;
    const messages = this.parseMessages(root, 30);
    if (messages.length === 0) return null;
    const title =
      firstText(qs(document, 'h1, h2 span, [role="main"] h1')) || 'Messenger chat';
    return {
      platformId: 'messenger',
      platformName: this.name,
      conversationId: this.hashId([location.pathname, title]),
      title,
      participants: [...new Set(messages.map((message) => message.author))],
      messages,
      canInsert: Boolean(this.findInputBox()),
      url: location.href,
    };
  }

  protected conversationRoot(): Element | null {
    return qs(document, '[role="main"]');
  }

  protected parseMessages(root: Element, limit: number): ChatMessageFromPlatform[] {
    const items = qsa(root, 'div[role="row"], div[role="listitem"]');
    const parsed: ChatMessageFromPlatform[] = [];
    for (const item of items) {
      const body = firstText(qs(item, 'div[dir="auto"], span[dir="auto"]'));
      if (!body || body.length > 4000) continue;
      const author = item.getAttribute('aria-label')?.split(',')[0]?.trim() || 'Contact';
      parsed.push({
        id: this.hashId([author, body.slice(0, 40), String(parsed.length)]),
        author,
        role: 'unknown',
        body,
      });
    }
    return parsed.slice(-limit);
  }

  protected composeSelectors(): readonly string[] {
    return [
      'div[aria-label="Message"][contenteditable="true"]',
      'div[aria-label*="message"][contenteditable="true"]',
      'div[role="textbox"][contenteditable="true"]',
    ];
  }
}
