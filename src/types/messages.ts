import { z } from 'zod';
import { REPLY_TONES, type ReplyTone } from '@/constants/tones';
import { ProviderId } from '@/constants/providers';
import { PlatformId } from '@/constants/platforms';

const toneTuple = REPLY_TONES as unknown as [ReplyTone, ...ReplyTone[]];
const toneSchema = z.enum(toneTuple);
const providerTuple = Object.values(ProviderId) as [ProviderId, ...ProviderId[]];
const platformTuple = Object.values(PlatformId) as [PlatformId, ...PlatformId[]];

const messageSchema = z.object({
  id: z.string().min(1).max(200),
  author: z.string().max(200),
  role: z.enum(['self', 'other', 'unknown']),
  body: z.string().max(20_000),
  timestamp: z.number().optional(),
});

const conversationSchema = z.object({
  platformId: z.enum(platformTuple),
  platformName: z.string().min(1).max(64),
  conversationId: z.string().min(1).max(500),
  title: z.string().max(500),
  participants: z.array(z.string().max(200)).max(50),
  messages: z.array(messageSchema).max(80),
  canInsert: z.boolean(),
  url: z.string().max(2000),
});

const rewriteSchema = z.object({
  action: z.enum([
    'grammar',
    'rewrite',
    'translate',
    'tone',
    'shorten',
    'expand',
    'explain',
  ]),
  targetTone: toneSchema.optional(),
  targetLanguage: z.string().max(64).optional(),
});

export const extensionRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('PING') }),
  z.object({ type: z.literal('GET_CONVERSATION') }),
  z.object({
    type: z.literal('INSERT_REPLY'),
    text: z.string().min(1).max(20_000),
  }),
  z.object({
    type: z.literal('GENERATE_REPLIES'),
    conversation: conversationSchema,
    tones: z.array(toneSchema).min(1).max(8),
  }),
  z.object({
    type: z.literal('SUMMARIZE'),
    conversation: conversationSchema,
  }),
  z.object({
    type: z.literal('REWRITE'),
    text: z.string().min(1).max(20_000),
    instruction: rewriteSchema,
  }),
  z.object({
    type: z.literal('FOLLOW_UPS'),
    conversation: conversationSchema,
  }),
  z.object({
    type: z.literal('ICEBREAKERS'),
    conversation: conversationSchema,
  }),
  z.object({ type: z.literal('GET_SETTINGS') }),
  z.object({
    type: z.literal('SAVE_SETTINGS'),
    settings: z.object({
      providerId: z.enum(providerTuple).optional(),
      model: z.string().max(120).optional(),
      baseUrl: z.string().max(500).optional(),
      temperature: z.number().min(0).max(2).optional(),
      responseLength: z.enum(['short', 'medium', 'long']).optional(),
      defaultTone: toneSchema.optional(),
      theme: z.enum(['system', 'light', 'dark']).optional(),
      generateCount: z.number().int().min(1).max(8).optional(),
    }),
  }),
  z.object({
    type: z.literal('SAVE_SECRET'),
    providerId: z.enum(providerTuple),
    apiKey: z.string().max(4000),
  }),
  z.object({ type: z.literal('GET_PROVIDERS') }),
  z.object({ type: z.literal('CLEAR_CACHE') }),
]);

export type ExtensionRequest = z.infer<typeof extensionRequestSchema>;

export type ExtensionSuccess<T> = { ok: true; data: T };
export type ExtensionFailure = {
  ok: false;
  error: { code: string; message: string };
};
export type ExtensionResponse<T> = ExtensionSuccess<T> | ExtensionFailure;
