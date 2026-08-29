import type { ChatMessage, ConversationContext } from '@/types/conversation';

export function lastOtherMessage(
  conversation: ConversationContext,
): ChatMessage | undefined {
  return [...conversation.messages].reverse().find((message) => message.role !== 'self');
}

export function transcript(conversation: ConversationContext, limit = 24): string {
  const slice = conversation.messages.slice(-limit);
  return slice
    .map((message) => `${message.author}: ${message.body.trim()}`)
    .join('\n');
}

export function conversationFingerprint(conversation: ConversationContext): string {
  return conversation.messages
    .map((message) => `${message.role}:${message.body}`)
    .join('|');
}
