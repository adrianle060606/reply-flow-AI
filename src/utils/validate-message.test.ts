import { describe, expect, it } from 'vitest';
import { parseExtensionRequest } from '@/utils/validate-message';

describe('parseExtensionRequest', () => {
  it('accepts a ping', () => {
    expect(parseExtensionRequest({ type: 'PING' })).toEqual({ type: 'PING' });
  });

  it('rejects an unknown type', () => {
    expect(() => parseExtensionRequest({ type: 'DROP_TABLE' })).toThrow();
  });

  it('rejects an oversized insert', () => {
    expect(() =>
      parseExtensionRequest({ type: 'INSERT_REPLY', text: 'x'.repeat(20_001) }),
    ).toThrow();
  });

  it('accepts generate with tones', () => {
    const request = parseExtensionRequest({
      type: 'GENERATE_REPLIES',
      tones: ['professional', 'short'],
      conversation: {
        platformId: 'gmail',
        platformName: 'Gmail',
        conversationId: 't1',
        title: 'Hello',
        participants: ['Ada'],
        canInsert: true,
        url: 'https://mail.google.com/',
        messages: [{ id: '1', author: 'Ada', role: 'other', body: 'Hi' }],
      },
    });
    expect(request.type).toBe('GENERATE_REPLIES');
  });
});
