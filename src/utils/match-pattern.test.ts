import { describe, expect, it } from 'vitest';
import { matchPattern, urlMatches } from '@/utils/match-pattern';

describe('matchPattern', () => {
  it('matches Gmail threads', () => {
    expect(matchPattern('https://mail.google.com/*', 'https://mail.google.com/mail/u/0/#inbox')).toBe(true);
  });

  it('matches wildcard Slack workspaces', () => {
    expect(matchPattern('https://*.slack.com/*', 'https://acme.slack.com/archives/C123')).toBe(true);
  });

  it('rejects a different host', () => {
    expect(matchPattern('https://web.whatsapp.com/*', 'https://mail.google.com/')).toBe(false);
  });

  it('matches any listed pattern', () => {
    expect(
      urlMatches(
        ['https://x.com/messages*', 'https://twitter.com/messages*'],
        'https://x.com/messages/123',
      ),
    ).toBe(true);
  });
});
