import type { ConversationContext } from '@/types/conversation';
import type { RewriteInstruction } from '@/types/ai-provider';
import type { ReplyTone } from '@/constants/tones';
import { TONE_COPY } from '@/constants/tones';
import { transcript } from '@/models/conversation';

export function systemPreamble(): string {
  return [
    'You are ReplyMe, an AI communication copilot.',
    'Write as the user, never as an assistant narrating a reply.',
    'Match the thread language. Do not invent facts, meetings, or commitments.',
    'Do not use markdown unless the original thread uses it.',
    'Never include the tone label in the reply body.',
  ].join(' ');
}

export function generatePrompt(
  conversation: ConversationContext,
  tones: ReplyTone[],
  memorySummary?: string,
): string {
  const toneLines = tones
    .map((tone) => `- ${tone}: ${TONE_COPY[tone].hint}`)
    .join('\n');
  const memory = memorySummary
    ? `\nKnown context from earlier in this thread:\n${memorySummary}\n`
    : '';
  return `Platform: ${conversation.platformName}
Thread: ${conversation.title}
Participants: ${conversation.participants.join(', ') || 'unknown'}
${memory}
Conversation:
${transcript(conversation)}

Write one reply for each tone:
${toneLines}

Return ONLY JSON:
{"replies":[{"tone":"<tone>","text":"<reply>"}]}`;
}

export function summarizePrompt(conversation: ConversationContext): string {
  return `Summarize this ${conversation.platformName} conversation in 4-6 sentences.
Cover: who is involved, the ask, decisions, open questions, and tone.
Thread: ${conversation.title}

${transcript(conversation, 40)}`;
}

export function rewritePrompt(text: string, instruction: RewriteInstruction): string {
  const actions: Record<typeof instruction.action, string> = {
    grammar: 'Fix grammar, spelling, and punctuation. Keep the meaning and voice.',
    rewrite: 'Rewrite for clarity. Keep the intent. Remove filler.',
    translate: `Translate into ${instruction.targetLanguage ?? 'English'}. Keep the register.`,
    tone: `Rewrite in a ${instruction.targetTone ?? 'professional'} tone.`,
    shorten: 'Cut this to the smallest message that still answers. Keep names and asks.',
    expand: 'Expand with a greeting, the point, and a clear close. Do not invent facts.',
    explain: 'Explain what this message is saying, in plain language, in 3-5 sentences.',
  };
  return `${actions[instruction.action]}

Message:
${text}

Return only the result text.`;
}

export function followUpPrompt(conversation: ConversationContext): string {
  return `Suggest 3 short follow-up messages the user could send next in this ${conversation.platformName} thread.
They should be specific to the conversation, not generic.
Return ONLY JSON: {"suggestions":["...","...","..."]}

${transcript(conversation)}`;
}

export function icebreakerPrompt(conversation: ConversationContext): string {
  return `Suggest 3 icebreaker openers the user could send to start or restart this ${conversation.platformName} conversation with "${conversation.title}".
Keep them natural and specific. Return ONLY JSON: {"suggestions":["...","...","..."]}

${transcript(conversation, 12)}`;
}
