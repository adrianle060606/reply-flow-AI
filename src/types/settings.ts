import type { ProviderId } from '@/constants/providers';
import type { ReplyTone } from '@/constants/tones';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResponseLength = 'short' | 'medium' | 'long';

export interface Settings {
  providerId: ProviderId;
  model: string;
  baseUrl: string;
  temperature: number;
  responseLength: ResponseLength;
  defaultTone: ReplyTone;
  theme: ThemePreference;
  generateCount: number;
}

export interface Secrets {
  apiKeys: Partial<Record<ProviderId, string>>;
}
