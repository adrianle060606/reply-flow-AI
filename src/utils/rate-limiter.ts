export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  tryConsume(now = Date.now()): { allowed: true } | { allowed: false; retryAfterMs: number } {
    this.prune(now);
    if (this.timestamps.length < this.max) {
      this.timestamps.push(now);
      return { allowed: true };
    }
    const oldest = this.timestamps[0] ?? now;
    return { allowed: false, retryAfterMs: this.windowMs - (now - oldest) };
  }

  private prune(now: number): void {
    this.timestamps = this.timestamps.filter((stamp) => now - stamp < this.windowMs);
  }
}
