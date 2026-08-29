import type { ConversationContext } from '@/types/conversation';
import type {
  ChatMessageFromPlatform,
  MessagingPlatform,
} from '@/types/messaging-platform';
import { firstMatching } from '@/adapters/shared/dom';
import { insertIntoEditable } from '@/adapters/shared/insert';

export abstract class BasePlatformAdapter implements MessagingPlatform {
  abstract readonly id: string;
  abstract readonly name: string;

  abstract detectConversation(): ConversationContext | null;

  extractMessages(limit = 30): ChatMessageFromPlatform[] {
    const root = this.conversationRoot();
    if (!root) return [];
    return this.parseMessages(root, limit);
  }

  findInputBox(): HTMLElement | null {
    const root = this.conversationRoot() ?? document;
    return firstMatching(this.composeSelectors(), root) ?? firstMatching(this.composeSelectors());
  }

  async insertReply(text: string): Promise<boolean> {
    const box = this.findInputBox();
    if (!box) return false;
    return insertIntoEditable(box, text);
  }

  getPlatformName(): string {
    return this.name;
  }

  protected abstract conversationRoot(): Element | null;
  protected abstract parseMessages(root: Element, limit: number): ChatMessageFromPlatform[];
  protected abstract composeSelectors(): readonly string[];

  protected hashId(parts: string[]): string {
    return `${this.id}:${parts.join(':').slice(0, 180)}`;
  }
}
