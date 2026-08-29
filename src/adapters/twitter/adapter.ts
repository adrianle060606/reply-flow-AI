import type { ConversationContext } from '@/types/conversation';
import type { ChatMessageFromPlatform } from '@/types/messaging-platform';
import { BasePlatformAdapter } from '@/adapters/shared/base-adapter';
import { firstText, qsa, qs } from '@/adapters/shared/dom';
import meta from './meta.json';

export class TwitterAdapter extends BasePlatformAdapter {
  readonly id = meta.id;
  readonly name = meta.name;

  detectConversation(): ConversationContext | null {
    const root = this.conversationRoot();
    if (!root) return null;
    const messages = this.parseMessages(root, 30);
    if (messages.length === 0) return null;
    const title =
      firstText(qs(document, '[data-testid="DMConversationHeader"] span, h2 span')) ||
      'X conversation';
    return {
      platformId: 'twitter',
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
      '[data-testid="DmScrollerContainer"], [data-testid="conversation"], [aria-label*="Timeline"]',
    );
  }

  protected parseMessages(root: Element, limit: number): ChatMessageFromPlatform[] {
    const items = qsa(root, '[data-testid="messageEntry"], [data-testid="cellInnerDiv"]');
    const parsed: ChatMessageFromPlatform[] = [];
    for (const item of items) {
      const body = firstText(qs(item, '[data-testid="tweetText"], span'));
      if (!body) continue;
      const author = firstText(qs(item, '[data-testid="User-Name"] span')) || 'Account';
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
      '[data-testid="dmComposerTextInput"]',
      'div[data-testid="dmComposerTextInput"][contenteditable="true"]',
      'div.public-DraftEditor-content[contenteditable="true"]',
    ];
  }
}
