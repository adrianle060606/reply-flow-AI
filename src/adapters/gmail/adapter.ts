import type { ConversationContext } from '@/types/conversation';
import type { ChatMessageFromPlatform } from '@/types/messaging-platform';
import { BasePlatformAdapter } from '@/adapters/shared/base-adapter';
import { firstText, qsa, qs } from '@/adapters/shared/dom';
import meta from './meta.json';

export class GmailAdapter extends BasePlatformAdapter {
  readonly id = meta.id;
  readonly name = meta.name;

  detectConversation(): ConversationContext | null {
    const root = this.conversationRoot();
    if (!root) return null;
    const messages = this.parseMessages(root, 30);
    if (messages.length === 0) return null;
    const subject = firstText(qs(document, 'h2[data-thread-perm-id], h2.hP')) || 'Gmail thread';
    const participants = [...new Set(messages.map((message) => message.author))];
    return {
      platformId: 'gmail',
      platformName: this.name,
      conversationId: this.hashId([subject, messages[0]?.id ?? '']),
      title: subject,
      participants,
      messages,
      canInsert: Boolean(this.findInputBox()),
      url: location.href,
    };
  }

  protected conversationRoot(): Element | null {
    return qs(document, 'div[role="main"]');
  }

  protected parseMessages(root: Element, limit: number): ChatMessageFromPlatform[] {
    const nodes = qsa(root, 'div[data-message-id], li.gmail_quote, div.adn');
    const parsed: ChatMessageFromPlatform[] = [];
    for (const node of nodes) {
      const body = firstText(qs(node, 'div[data-message-id] .a3s, .a3s.aiL, div[dir="ltr"]'))
        || firstText(node);
      if (!body || body.length < 2) continue;
      const author = firstText(qs(node, 'span.gD, span[email], h3')) || 'Unknown';
      const email = qs<HTMLElement>(node, 'span[email]')?.getAttribute('email') ?? '';
      const selfEmail = document.body.getAttribute('data-email') ?? '';
      const role = selfEmail && email === selfEmail ? 'self' : 'other';
      parsed.push({
        id: node.getAttribute('data-message-id') ?? this.hashId([author, body.slice(0, 40)]),
        author,
        role,
        body,
      });
    }
    return parsed.slice(-limit);
  }

  protected composeSelectors(): readonly string[] {
    return [
      'div[aria-label="Message Body"]',
      'div[g_editable="true"][role="textbox"]',
      'div[contenteditable="true"][aria-label*="Message"]',
      'div[contenteditable="true"][g_editable="true"]',
    ];
  }
}
