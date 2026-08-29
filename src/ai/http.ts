import { RateLimitedError, AppError } from '@/utils/errors';

export async function postJson<T>(
  url: string,
  body: unknown,
  headers: Record<string, string>,
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after'));
    throw new RateLimitedError(Number.isFinite(retryAfter) ? retryAfter * 1000 : undefined);
  }

  if (!response.ok) {
    const detail = await safeText(response);
    throw new AppError(
      'PROVIDER_ERROR',
      `The AI provider returned ${response.status}. ${detail.slice(0, 280)}`.trim(),
    );
  }

  return (await response.json()) as T;
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

export function assistantTextFromOpenAI(payload: {
  choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
}): string {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((part) => part.text ?? '').join('');
  }
  throw new AppError('PROVIDER_ERROR', 'The provider returned an empty completion.');
}
