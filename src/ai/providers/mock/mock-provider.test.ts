import { describe, expect, it } from 'vitest';
import { MockProvider } from '@/ai/providers/mock';
import { SAMPLE_CONVERSATIONS } from '@/preview/sample-data';

describe('MockProvider', () => {
  const provider = new MockProvider();
  const conversation = SAMPLE_CONVERSATIONS[0]!;

  it('returns one card per requested tone', async () => {
    const replies = await provider.generateReply({
      conversation,
      tones: ['professional', 'funny', 'short'],
      temperature: 0.7,
      maxTokens: 400,
    });
    expect(replies).toHaveLength(3);
    expect(replies.map((item) => item.tone)).toEqual(['professional', 'funny', 'short']);
    expect(replies.every((item) => item.text.length > 10)).toBe(true);
  });

  it('summarizes without network', async () => {
    const summary = await provider.summarize(conversation);
    expect(summary.toLowerCase()).toContain('gmail');
  });
});
