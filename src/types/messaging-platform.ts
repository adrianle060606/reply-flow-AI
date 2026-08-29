import type { ConversationContext } from '@/types/conversation';

export interface PlatformMeta {
  id: string;
  name: string;
  matches: string[];
}

export interface MessagingPlatform {
  detectConversation(): ConversationContext | null;
  extractMessages(limit?: number): ChatMessageFromPlatform[];
  findInputBox(): HTMLElement | null;
  insertReply(text: string): Promise<boolean>;
  getPlatformName(): string;
}

export interface ChatMessageFromPlatform {
  id: string;
  author: string;
  role: 'self' | 'other' | 'unknown';
  body: string;
  timestamp?: number;
}

export interface PlatformModule {
  meta: PlatformMeta;
  createAdapter(): MessagingPlatform;
}
