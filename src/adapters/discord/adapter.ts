import type { ConversationContext } from '@/types/conversation';
import type { ChatMessageFromPlatform } from '@/types/messaging-platform';
import { BasePlatformAdapter } from '@/adapters/shared/base-adapter';
import { firstText, qsa, qs } from '@/adapters/shared/dom';
import meta from './meta.json';

export class DiscordAdapter extends BasePlatformAdapter {
  readonly id = meta.id;
  readonly name = meta.name;

  detectConversation(): ConversationContext | null {
    const root = this.conversationRoot();
    if (!root) return null;
    const messages = this.parseMessages(root, 30);
    if (messages.length === 0) return null;
    const title =
      firstText(qs(document, 'h1[class*="title"], h3[class*="title"], div[class*="title"] h1')) ||
      'Discord channel';
    return {
      platformId: 'discord',
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
    return qs(document, 'ol[data-list-id="chat-messages"], div[class*="chatContent"]');
  }

  protected parseMessages(root: Element, limit: number): ChatMessageFromPlatform[] {
    const items = qsa(root, 'li[id^="chat-messages-"], li[class*="messageListItem"]');
    const parsed: ChatMessageFromPlatform[] = [];
    for (const item of items) {
      const body = firstText(
        qs(item, 'div[id^="message-content-"], div[class*="messageContent"]'),
      );
      if (!body) continue;
      const author = firstText(qs(item, 'span[class*="username"], h3 span')) || 'Member';
      parsed.push({
        id: item.id || this.hashId([author, body.slice(0, 40)]),
        author,
        role: 'unknown',
        body,
      });
    }
    return parsed.slice(-limit);
  }

  protected composeSelectors(): readonly string[] {
    return [
      'div[role="textbox"][data-slate-editor="true"]',
      'div[class*="slateTextArea"]',
      'div[class*="editor"][contenteditable="true"]',
    ];
  }
}
