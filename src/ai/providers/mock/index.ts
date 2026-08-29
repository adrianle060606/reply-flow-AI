import type {
  AIProvider,
  GenerateReplyRequest,
  GeneratedReply,
  RewriteInstruction,
} from '@/types/ai-provider';
import type { ConversationContext } from '@/types/conversation';
import { ProviderId } from '@/constants/providers';
import type { ReplyTone } from '@/constants/tones';
import { lastOtherMessage, transcript } from '@/models/conversation';

export const meta = {
  id: ProviderId.Mock,
  name: 'Mock (offline)',
  needsApiKey: false,
};

const closers: Record<ReplyTone, (name: string) => string> = {
  professional: () => `Best,\nAdrian`,
  friendly: (name) => `Thanks ${name} — talk soon!`,
  casual: () => `Sounds good — I'll ping you.`,
  funny: () => `If Thursday combusts, I have a backup calendar and a backup joke.`,
  empathetic: (name) => `Appreciate you ${name}. I'll come prepared.`,
  short: () => `Thursday 3pm PT works. I'll send a calendar invite.`,
  long: () =>
    `I'll send a short agenda beforehand so we can spend the time on the lazy-load path and the key-handling review rather than recapping the doc.`,
  assertive: () => `Confirming Thursday 3pm PT. I'll send the invite in the next hour.`,
};

export class MockProvider implements AIProvider {
  readonly id = meta.id;
  readonly name = meta.name;
  readonly defaultModel = 'mock-replyme';

  listModels(): string[] {
    return [this.defaultModel];
  }

  async generateReply(request: GenerateReplyRequest): Promise<GeneratedReply[]> {
    await wait(380);
    const other = lastOtherMessage(request.conversation);
    const name = firstName(other?.author ?? request.conversation.title);
    const ask = inferAsk(request.conversation);
    return request.tones.map((tone, index) => ({
      id: `mock-${tone}-${index}`,
      tone,
      text: buildReply(tone, name, ask, request.conversation.title),
      provider: this.name,
      model: this.defaultModel,
    }));
  }

  async summarize(conversation: ConversationContext): Promise<string> {
    await wait(280);
    const other = lastOtherMessage(conversation);
    return `${conversation.platformName} thread “${conversation.title}” with ${conversation.participants.join(', ') || 'unknown participants'}. Latest note from ${other?.author ?? 'the other person'}: “${(other?.body ?? '').slice(0, 180)}”. Open work: answer the latest ask, keep the thread moving, and avoid over-promising.`;
  }

  async rewrite(text: string, instruction: RewriteInstruction): Promise<string> {
    await wait(220);
    const trimmed = text.trim();
    switch (instruction.action) {
      case 'shorten':
        return trimmed.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
      case 'expand':
        return `Hi —\n\n${trimmed}\n\nHappy to adjust if that timing does not work.\n\nThanks`;
      case 'grammar':
        return trimmed.replace(/\bi\b/g, 'I').replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1');
      case 'tone':
        return `${trimmed}\n\n— rewritten in a ${instruction.targetTone ?? 'professional'} register.`;
      case 'translate':
        return `[${instruction.targetLanguage ?? 'English'}]\n${trimmed}`;
      case 'explain':
        return `This message is asking the other person to respond to: “${trimmed.slice(0, 240)}”. The expected next step is a clear yes/no or a proposed alternative.`;
      default:
        return trimmed.replace(/\n{3,}/g, '\n\n');
    }
  }

  async suggestFollowUps(conversation: ConversationContext): Promise<string[]> {
    await wait(220);
    const name = firstName(lastOtherMessage(conversation)?.author ?? 'there');
    return [
      `Does Thursday 3pm PT still work for you, ${name}?`,
      'I can send a 20-minute agenda covering the registry and the insert path.',
      'Want me to record a 2-minute loom if calendars slip?',
    ];
  }

  async suggestIcebreakers(conversation: ConversationContext): Promise<string[]> {
    await wait(220);
    return [
      `Hey — still thinking about ${conversation.title}. Open to a quick sync this week?`,
      'I had one tighter way to phrase the adapter contract if you want a look.',
      'No rush on the doc — I can start a spike on the Gmail selectors either way.',
    ];
  }
}

export function createProvider(): AIProvider {
  return new MockProvider();
}

function buildReply(tone: ReplyTone, name: string, ask: string, title: string): string {
  const heading: Record<ReplyTone, string> = {
    professional: `Hi ${name},\n\nThanks for the note on ${title}. ${ask} I can do Thursday at 3pm PT and will walk through adapter lazy-loading plus keeping API keys in the service worker only.`,
    friendly: `Hey ${name} — really glad the architecture landed. ${ask} Thursday 3pm PT works on my side.`,
    casual: `Hey ${name}, yep — lazy-load the adapters, keys stay in the worker. Thursday 3pm PT is good.`,
    funny: `Hi ${name} — I promise the adapters load faster than I write commit messages. ${ask} Thursday 3pm PT, I'll bring the architecture and fewer jokes than this sentence.`,
    empathetic: `Hi ${name}, thanks for reading the doc so carefully — those are the two questions that actually matter. ${ask} Thursday 3pm PT works, and I'll come with a tight demo.`,
    short: `Thursday 3pm PT works. Yes to lazy-loaded adapters and worker-only keys.`,
    long: `Hi ${name},\n\nThanks for reviewing the design. Yes: adapters should lazy-load so a Gmail tab never pays for Discord selectors, and API keys must live only in the MV3 service worker — content scripts on mail.google.com should never see them.\n\n${ask} Thursday 3pm PT is open. I'll send a 20-minute agenda covering the registry, the insert path, and a live generate → insert demo.`,
    assertive: `Hi ${name} — yes to both: lazy-loaded adapters and worker-only keys. Let's use Thursday 3pm PT. I'll send the invite.`,
  };
  return `${heading[tone]}\n\n${closers[tone](name)}`.trim();
}

function inferAsk(conversation: ConversationContext): string {
  const blob = transcript(conversation).toLowerCase();
  if (blob.includes('thursday') || blob.includes('demo')) {
    return 'Happy to demo Thursday.';
  }
  if (blob.includes('?')) return 'I can answer those directly.';
  return 'Happy to take the next step.';
}

function firstName(value: string): string {
  const token = value.split(/[\s|·,-]/)[0]?.trim();
  return token && token.length > 1 ? token : 'there';
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
