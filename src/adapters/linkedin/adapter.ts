import type { ConversationContext } from '@/types/conversation';
import type { ChatMessageFromPlatform } from '@/types/messaging-platform';
import { BasePlatformAdapter } from '@/adapters/shared/base-adapter';
import { firstText, qsa, qs } from '@/adapters/shared/dom';
import meta from './meta.json';

export class LinkedInAdapter extends BasePlatformAdapter {
  readonly id = meta.id;
  readonly name = meta.name;

  detectConversation(): ConversationContext | null {
    const root = this.conversationRoot();
    if (!root) return null;
    const messages = this.parseMessages(root, 30);
    if (messages.length === 0) return null;
    const title =
      firstText(
        qs(document, '.msg-overlay-bubble-header__title, .msg-entity-lockup__entity-title, h2.msg-thread__link-to-profile'),
      ) || 'LinkedIn message';
    return {
      platformId: 'linkedin',
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
      '.msg-s-message-list-container, .msg-s-message-list, ul.msg-s-message-list-content',
    );
  }

  protected parseMessages(root: Element, limit: number): ChatMessageFromPlatform[] {
    const items = qsa(root, '.msg-s-event-listitem, li.msg-s-message-list__event');
    const parsed: ChatMessageFromPlatform[] = [];
    for (const item of items) {
      const body = firstText(
        qs(item, '.msg-s-event-listitem__body, p.msg-s-event-listitem__message-snippet, .msg-s-event__content'),
      );
      if (!body) continue;
      const author = firstText(qs(item, '.msg-s-message-group__name, .msg-s-event-listitem__name')) || 'Connection';
      const self = Boolean(item.querySelector('.msg-s-event-listitem--other')) === false
        && item.className.includes('msg-s-message-group--self');
      parsed.push({
        id: item.getAttribute('data-event-urn') ?? this.hashId([author, body.slice(0, 40)]),
        author,
        role: self ? 'self' : 'other',
        body,
      });
    }
    return parsed.slice(-limit);
  }

  protected composeSelectors(): readonly string[] {
    return [
      '.msg-form__contenteditable',
      'div.msg-form__msg-content-container [contenteditable="true"]',
      '.msg-form__message-texteditor [contenteditable="true"]',
    ];
  }
}
