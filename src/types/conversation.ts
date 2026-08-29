import type { PlatformId } from '@/constants/platforms';

export type AuthorRole = 'self' | 'other' | 'unknown';

export interface ChatMessage {
  id: string;
  author: string;
  role: AuthorRole;
  body: string;
  timestamp?: number;
}

export interface ConversationContext {
  platformId: PlatformId;
  platformName: string;
  conversationId: string;
  title: string;
  participants: string[];
  messages: ChatMessage[];
  canInsert: boolean;
  url: string;
}
