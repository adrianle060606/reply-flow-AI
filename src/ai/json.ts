export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = fenced?.[1]?.trim() ?? trimmed;
  const start = payload.indexOf('{');
  const end = payload.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Provider did not return JSON.');
  }
  return JSON.parse(payload.slice(start, end + 1));
}

export function asStringArray(value: unknown, key: string): string[] {
  if (!value || typeof value !== 'object' || !(key in value)) return [];
  const arr = (value as Record<string, unknown>)[key];
  if (!Array.isArray(arr)) return [];
  return arr.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}
