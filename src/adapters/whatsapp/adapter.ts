import type { ConversationContext } from '@/types/conversation';
import type { ChatMessageFromPlatform } from '@/types/messaging-platform';
import { BasePlatformAdapter } from '@/adapters/shared/base-adapter';
import { firstText, qsa, qs } from '@/adapters/shared/dom';
import meta from './meta.json';

export class WhatsAppAdapter extends BasePlatformAdapter {
  readonly id = meta.id;
  readonly name = meta.name;

  detectConversation(): ConversationContext | null {
    const root = this.conversationRoot();
    if (!root) return null;
    const messages = this.parseMessages(root, 30);
    if (messages.length === 0) return null;
    const title =
      firstText(qs(document, 'header span[dir="auto"], #main header span[title]')) ||
      'WhatsApp chat';
    return {
      platformId: 'whatsapp',
      platformName: this.name,
      conversationId: this.hashId([title]),
      title,
      participants: [...new Set(messages.map((message) => message.author))],
      messages,
      canInsert: Boolean(this.findInputBox()),
      url: location.href,
    };
  }

  protected conversationRoot(): Element | null {
    return qs(document, '#main, div[data-testid="conversation-panel-wrapper"]');
  }

  protected parseMessages(root: Element, limit: number): ChatMessageFromPlatform[] {
    const rows = qsa(root, 'div[data-id], div.message-in, div.message-out');
    const parsed: ChatMessageFromPlatform[] = [];
    for (const row of rows) {
      const body = firstText(
        qs(row, 'span.selectable-text, div.copyable-text span, .selectable-text'),
      );
      if (!body) continue;
      const outgoing = row.classList.contains('message-out') || Boolean(row.querySelector('[data-testid="msg-meta"]'));
      const isOut = row.className.includes('message-out') || row.getAttribute('data-id')?.includes('true');
      const author = firstText(qs(row, 'span[dir="auto"]._ahxt, span.x1iyjqo2')) || (isOut || outgoing ? 'You' : 'Contact');
      parsed.push({
        id: row.getAttribute('data-id') ?? this.hashId([body.slice(0, 40)]),
        author,
        role: author === 'You' || isOut ? 'self' : 'other',
        body,
      });
    }
    return parsed.slice(-limit);
  }

  protected composeSelectors(): readonly string[] {
    return [
      'footer div[contenteditable="true"][data-tab]',
      '#main footer div[contenteditable="true"]',
      'div[title="Type a message"]',
      'footer div[role="textbox"]',
    ];
  }
}
