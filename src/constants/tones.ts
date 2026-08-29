export const ReplyTone = {
  Professional: 'professional',
  Friendly: 'friendly',
  Casual: 'casual',
  Funny: 'funny',
  Empathetic: 'empathetic',
  Short: 'short',
  Long: 'long',
  Assertive: 'assertive',
} as const;

export type ReplyTone = (typeof ReplyTone)[keyof typeof ReplyTone];

export const REPLY_TONES: readonly ReplyTone[] = Object.values(ReplyTone);

export const TONE_COPY: Record<
  ReplyTone,
  { label: string; hint: string }
> = {
  professional: { label: 'Professional', hint: 'Clear, polished, workplace-ready' },
  friendly: { label: 'Friendly', hint: 'Warm without being casual' },
  casual: { label: 'Casual', hint: 'Relaxed and conversational' },
  funny: { label: 'Funny', hint: 'Light humor, never mean' },
  empathetic: { label: 'Empathetic', hint: 'Acknowledge feelings first' },
  short: { label: 'Short', hint: 'Two sentences, max' },
  long: { label: 'Long', hint: 'Thorough and specific' },
  assertive: { label: 'Assertive', hint: 'Direct, with a clear ask' },
};
