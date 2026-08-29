import { useCallback, useEffect, useState } from 'react';
import { sendMessage } from '@/hooks/runtime';
import type { ConversationContext } from '@/types/conversation';
import { AppError } from '@/utils/errors';

export function useConversation() {
  const [conversation, setConversation] = useState<ConversationContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sendMessage<ConversationContext>({ type: 'GET_CONVERSATION' });
      setConversation(data);
    } catch (err) {
      setConversation(null);
      setError(err instanceof AppError || err instanceof Error ? err.message : 'No conversation found.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { conversation, loading, error, refresh };
}
