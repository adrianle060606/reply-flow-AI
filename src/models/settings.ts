import { ReplyTone } from '@/constants/tones';
import { ProviderId } from '@/constants/providers';
import type { Settings } from '@/types/settings';

export const DEFAULT_SETTINGS: Settings = {
  providerId: ProviderId.Mock,
  model: 'mock-replyme',
  baseUrl: '',
  temperature: 0.7,
  responseLength: 'medium',
  defaultTone: ReplyTone.Professional,
  theme: 'system',
  generateCount: 3,
};

export function mergeSettings(partial: Partial<Settings> | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...partial };
}

export function tokensForLength(length: Settings['responseLength']): number {
  if (length === 'short') return 400;
  if (length === 'long') return 1600;
  return 800;
}
