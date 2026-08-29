import type { ConversationContext } from '@/types/conversation';
import type { ChatMessageFromPlatform } from '@/types/messaging-platform';
import { BasePlatformAdapter } from '@/adapters/shared/base-adapter';
import { firstText, qsa, qs } from '@/adapters/shared/dom';
import meta from './meta.json';

export class GoogleMessagesAdapter extends BasePlatformAdapter {
  readonly id = meta.id;
  readonly name = meta.name;

  detectConversation(): ConversationContext | null {
    const root = this.conversationRoot();
    if (!root) return null;
    const messages = this.parseMessages(root, 30);
    if (messages.length === 0) return null;
    const title =
      firstText(qs(document, 'h1, [class*="conversation-title"], mws-conversation-name')) ||
      'Google Messages';
    return {
      platformId: 'google-messages',
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
    return qs(document, 'mws-message-list, [class*="message-list"], main');
  }

  protected parseMessages(root: Element, limit: number): ChatMessageFromPlatform[] {
    const items = qsa(root, 'mws-message-wrapper, [class*="message-wrapper"], mws-text-message');
    const parsed: ChatMessageFromPlatform[] = [];
    for (const item of items) {
      const body = firstText(qs(item, 'mws-message-part-content, [class*="text-content"], span')) || firstText(item);
      if (!body) continue;
      const outgoing = item.getAttribute('is-outgoing') === 'true' || item.className.includes('outgoing');
      parsed.push({
        id: item.getAttribute('msg-id') ?? this.hashId([body.slice(0, 40), String(parsed.length)]),
        author: outgoing ? 'You' : 'Contact',
        role: outgoing ? 'self' : 'other',
        body,
      });
    }
    return parsed.slice(-limit);
  }

  protected composeSelectors(): readonly string[] {
    return [
      'textarea[aria-label*="message" i]',
      'textarea[placeholder*="message" i]',
      'mws-message-compose textarea',
      'div[contenteditable="true"][aria-label*="message" i]',
    ];
  }
}
