import { useCallback, useState } from 'react';
import { sendMessage } from '@/hooks/runtime';
import type { ConversationContext } from '@/types/conversation';
import type { GeneratedReply, RewriteInstruction } from '@/types/ai-provider';
import type { ReplyTone } from '@/constants/tones';

export function useCopilot() {
  const [replies, setReplies] = useState<GeneratedReply[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The copilot could not complete that.');
      return undefined;
    } finally {
      setBusy(false);
    }
  }, []);

  const generate = useCallback(
    (conversation: ConversationContext, tones: ReplyTone[]) =>
      run(async () => {
        const next = await sendMessage<GeneratedReply[]>({
          type: 'GENERATE_REPLIES',
          conversation,
          tones,
        });
        setReplies(next);
        return next;
      }),
    [run],
  );

  const summarize = useCallback(
    (conversation: ConversationContext) =>
      run(async () => {
        const payload = await sendMessage<{ summary: string }>({ type: 'SUMMARIZE', conversation });
        setSummary(payload.summary);
        return payload.summary;
      }),
    [run],
  );

  const followUps = useCallback(
    (conversation: ConversationContext) =>
      run(async () => {
        const payload = await sendMessage<{ suggestions: string[] }>({ type: 'FOLLOW_UPS', conversation });
        setSuggestions(payload.suggestions);
        return payload.suggestions;
      }),
    [run],
  );

  const icebreakers = useCallback(
    (conversation: ConversationContext) =>
      run(async () => {
        const payload = await sendMessage<{ suggestions: string[] }>({ type: 'ICEBREAKERS', conversation });
        setSuggestions(payload.suggestions);
        return payload.suggestions;
      }),
    [run],
  );

  const rewrite = useCallback(
    (text: string, instruction: RewriteInstruction) =>
      run(() => sendMessage<{ text: string }>({ type: 'REWRITE', text, instruction }).then((p) => p.text)),
    [run],
  );

  const insert = useCallback(
    (text: string) => sendMessage<{ inserted: boolean }>({ type: 'INSERT_REPLY', text }),
    [],
  );

  return {
    replies,
    summary,
    suggestions,
    busy,
    error,
    generate,
    summarize,
    followUps,
    icebreakers,
    rewrite,
    insert,
    setReplies,
  };
}
