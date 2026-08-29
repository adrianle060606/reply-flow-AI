import type { ConversationContext } from '@/types/conversation';
import type { ChatMessageFromPlatform } from '@/types/messaging-platform';
import { BasePlatformAdapter } from '@/adapters/shared/base-adapter';
import { firstText, qsa, qs } from '@/adapters/shared/dom';
import meta from './meta.json';

export class SlackAdapter extends BasePlatformAdapter {
  readonly id = meta.id;
  readonly name = meta.name;

  detectConversation(): ConversationContext | null {
    const root = this.conversationRoot();
    if (!root) return null;
    const messages = this.parseMessages(root, 30);
    if (messages.length === 0) return null;
    const title =
      firstText(
        qs(document, '[data-qa="channel_name"], .p-view_header__channel_title, h2[class*="p-view_header"]'),
      ) || 'Slack conversation';
    return {
      platformId: 'slack',
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
    return qs(
      document,
      '[data-qa="slack_kit_list"], .c-virtual_list__scroll_container, [data-qa="message_pane"]',
    );
  }

  protected parseMessages(root: Element, limit: number): ChatMessageFromPlatform[] {
    const items = qsa(root, '[data-qa="message_container"], .c-message_kit__background, [role="listitem"]');
    const parsed: ChatMessageFromPlatform[] = [];
    for (const item of items) {
      const body = firstText(
        qs(item, '[data-qa="message_content"], .p-rich_text_section, .c-message_kit__text'),
      );
      if (!body) continue;
      const author = firstText(qs(item, '[data-qa="message_sender_name"], .c-message__sender')) || 'Teammate';
      parsed.push({
        id: item.getAttribute('data-ts') ?? this.hashId([author, body.slice(0, 40)]),
        author,
        role: 'unknown',
        body,
      });
    }
    return parsed.slice(-limit);
  }

  protected composeSelectors(): readonly string[] {
    return [
      '[data-qa="message_input"] [contenteditable="true"]',
      '.ql-editor[contenteditable="true"]',
      'div[data-qa="message_input"]',
    ];
  }
}
