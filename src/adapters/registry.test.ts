import { describe, expect, it } from 'vitest';
import { allPlatformModules, moduleForUrl } from '@/adapters/registry';

describe('platform registry', () => {
  it('registers every shipped adapter', () => {
    const ids = allPlatformModules().map((mod) => mod.meta.id).sort();
    expect(ids).toEqual([
      'discord',
      'gmail',
      'google-messages',
      'linkedin',
      'messenger',
      'slack',
      'twitter',
      'whatsapp',
    ]);
  });

  it('resolves Gmail by URL without a switch statement', () => {
    const mod = moduleForUrl('https://mail.google.com/mail/u/0/#inbox/FMfc');
    expect(mod?.meta.name).toBe('Gmail');
  });
});
