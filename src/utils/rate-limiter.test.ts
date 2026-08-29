import { describe, expect, it } from 'vitest';
import { RateLimiter } from '@/utils/rate-limiter';

describe('RateLimiter', () => {
  it('allows traffic under the cap and blocks after', () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.tryConsume(0).allowed).toBe(true);
    expect(limiter.tryConsume(10).allowed).toBe(true);
    const blocked = limiter.tryConsume(20);
    expect(blocked.allowed).toBe(false);
  });
});
