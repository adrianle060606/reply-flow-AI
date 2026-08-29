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

interface ThreadScene {
  name: string;
  title: string;
  lastAsk: string;
  points: string[];
  nextStep: string;
}

export class MockProvider implements AIProvider {
  readonly id = meta.id;
  readonly name = meta.name;
  readonly defaultModel = 'mock-replyme';

  listModels(): string[] {
    return [this.defaultModel];
  }

  async generateReply(request: GenerateReplyRequest): Promise<GeneratedReply[]> {
    await wait(380);
    const scene = sceneFrom(request.conversation);
    return request.tones.map((tone, index) => ({
      id: `mock-${request.conversation.conversationId}-${tone}-${index}`,
      tone,
      text: buildReply(tone, scene),
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
    const scene = sceneFrom(conversation);
    return [
      scene.nextStep,
      `Want a tighter version of: “${scene.lastAsk.slice(0, 72)}${scene.lastAsk.length > 72 ? '…' : ''}”?`,
      `I can reply in ${conversation.platformName} with the next step in one message.`,
    ];
  }

  async suggestIcebreakers(conversation: ConversationContext): Promise<string[]> {
    await wait(220);
    return [
      `Hey — still thinking about ${conversation.title}. Open to a quick sync this week?`,
      `Had one follow-up on what you wrote last, if now is a decent time.`,
      `No rush — I can pick this up in ${conversation.platformName} whenever you are free.`,
    ];
  }
}

export function createProvider(): AIProvider {
  return new MockProvider();
}

export function sceneFrom(conversation: ConversationContext): ThreadScene {
  const other = lastOtherMessage(conversation);
  const blob = transcript(conversation).toLowerCase();
  const lastAsk = (other?.body ?? '').trim();
  const points: string[] = [];
  let nextStep = 'Happy to take the next step.';

  if (blob.includes('standup') || blob.includes('patch')) {
    nextStep = "I'll have a tiny patch up before standup.";
  } else if (blob.includes('thursday') || blob.includes('3pm')) {
    nextStep = 'Thursday 3pm PT works.';
  } else if (blob.includes('next week') || blob.includes('30-minute') || blob.includes('30 minutes')) {
    nextStep = "Yes — I'm open to 30 minutes next week. I'll send a few times.";
  }

  if (blob.includes('lazy-load')) points.push('adapters should lazy-load');
  if (blob.includes('api key') || blob.includes('service worker')) {
    points.push('keys stay in the service worker only');
  }
  if (blob.includes('content script') || blob.includes('firing twice') || blob.includes('fingerprint')) {
    points.push('gate the content script on a conversation fingerprint so Gmail compose does not double-fire');
  }
  if (blob.includes('open/closed') || blob.includes('intern')) {
    points.push('glad the adapter architecture resonated');
  }

  return {
    name: firstName(other?.author ?? conversation.title),
    title: conversation.title,
    lastAsk,
    points,
    nextStep,
  };
}

function buildReply(tone: ReplyTone, scene: ThreadScene): string {
  const facts = scene.points.length ? scene.points.join(', and ') + '.' : '';
  const ask = scene.lastAsk ? `You asked: “${clip(scene.lastAsk, 140)}”` : `Re: ${scene.title}`;
  const body: Record<ReplyTone, string> = {
    professional: `Hi ${scene.name},\n\n${ask}\n\n${facts} ${scene.nextStep}`.trim(),
    friendly: `Hey ${scene.name} — thanks for flagging this on ${scene.title}. ${facts} ${scene.nextStep}`,
    casual: `Hey ${scene.name}, got it. ${facts} ${scene.nextStep}`,
    funny: `Hi ${scene.name} — I read that twice so I would not ship the wrong thread. ${facts} ${scene.nextStep}`,
    empathetic: `Hi ${scene.name}, that is a fair ask. ${ask}\n\n${facts} ${scene.nextStep}`,
    short: scene.nextStep,
    long: `Hi ${scene.name},\n\n${ask}\n\n${facts || 'I can take this from here.'}\n\n${scene.nextStep}\n\nI will keep the reply specific to this thread and skip anything we did not actually discuss.`,
    assertive: `Hi ${scene.name} — ${scene.nextStep} ${facts}`.trim(),
  };
  return `${body[tone]}\n\n${closer(tone, scene.name)}`.trim();
}

function closer(tone: ReplyTone, name: string): string {
  if (tone === 'professional') return 'Best,\nAdrian';
  if (tone === 'friendly' || tone === 'empathetic') return `Thanks ${name} — talk soon.`;
  if (tone === 'short' || tone === 'assertive') return '';
  return "I'll ping you when it is in.";
}

function clip(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function firstName(value: string): string {
  const token = value.split(/[\s|·,-]/)[0]?.trim();
  return token && token.length > 1 ? token : 'there';
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
