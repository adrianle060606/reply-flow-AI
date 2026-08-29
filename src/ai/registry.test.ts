import { describe, expect, it } from 'vitest';
import { allProviderModules } from '@/ai/registry';

describe('provider registry', () => {
  it('discovers every vendor plugin', () => {
    const ids = allProviderModules().map((mod) => mod.meta.id).sort();
    expect(ids).toContain('openai');
    expect(ids).toContain('mock');
    expect(ids).toContain('gemini');
    expect(ids).toContain('claude');
    expect(ids).toContain('openrouter');
    expect(ids).toContain('deepseek');
    expect(ids).toContain('ollama');
  });
});
