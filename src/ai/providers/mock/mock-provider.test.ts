import { describe, expect, it } from 'vitest';
import { MockProvider } from '@/ai/providers/mock';
import { SAMPLE_CONVERSATIONS } from '@/preview/sample-data';

describe('MockProvider', () => {
  const provider = new MockProvider();
  const gmail = SAMPLE_CONVERSATIONS[0]!;
  const slack = SAMPLE_CONVERSATIONS[1]!;
  const linkedin = SAMPLE_CONVERSATIONS[2]!;

  it('returns one card per requested tone', async () => {
    const replies = await provider.generateReply({
      conversation: gmail,
      tones: ['professional', 'funny', 'short'],
      temperature: 0.7,
      maxTokens: 400,
    });
    expect(replies).toHaveLength(3);
    expect(replies.map((item) => item.tone)).toEqual(['professional', 'funny', 'short']);
    expect(replies.every((item) => item.text.length > 10)).toBe(true);
  });

  it('answers the Gmail thread with the demo time', async () => {
    const [reply] = await provider.generateReply({
      conversation: gmail,
      tones: ['short'],
      temperature: 0.7,
      maxTokens: 200,
    });
    expect(reply?.text.toLowerCase()).toContain('thursday');
  });

  it('answers Slack from the oncall thread, not the Gmail demo', async () => {
    const [reply] = await provider.generateReply({
      conversation: slack,
      tones: ['professional'],
      temperature: 0.7,
      maxTokens: 400,
    });
    const text = reply?.text.toLowerCase() ?? '';
    expect(text).toMatch(/standup|fingerprint|content script|patch/);
    expect(text).not.toContain('thursday 3pm');
  });

  it('answers LinkedIn with a meeting offer', async () => {
    const [reply] = await provider.generateReply({
      conversation: linkedin,
      tones: ['short'],
      temperature: 0.7,
      maxTokens: 200,
    });
    expect(reply?.text.toLowerCase()).toMatch(/30 minutes|next week/);
  });

  it('summarizes without network', async () => {
    const summary = await provider.summarize(gmail);
    expect(summary.toLowerCase()).toContain('gmail');
  });
});
