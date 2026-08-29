export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export class RateLimitedError extends AppError {
  constructor(retryAfterMs?: number) {
    super(
      'RATE_LIMITED',
      retryAfterMs
        ? `The provider rate-limited this request. Retry in ${Math.ceil(retryAfterMs / 1000)}s.`
        : 'The provider rate-limited this request. Wait a moment and try again.',
    );
    this.name = 'RateLimitedError';
  }
}

export class MissingApiKeyError extends AppError {
  constructor(providerName: string) {
    super(
      'MISSING_API_KEY',
      `Add a ${providerName} API key in Settings, or switch to the Mock provider to try ReplyMe without a key.`,
    );
    this.name = 'MissingApiKeyError';
  }
}

export class PlatformNotFoundError extends AppError {
  constructor() {
    super(
      'NO_CONVERSATION',
      'Open a conversation on a supported site, then reopen ReplyMe.',
    );
    this.name = 'PlatformNotFoundError';
  }
}
