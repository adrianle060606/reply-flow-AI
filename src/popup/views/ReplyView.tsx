import { RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { ConversationContext } from '@/types/conversation';
import type { GeneratedReply } from '@/types/ai-provider';
import type { ReplyTone } from '@/constants/tones';
import { Button } from '@/components/ui/button';
import { TonePicker } from '@/components/TonePicker';
import { ReplyCard } from '@/components/ReplyCard';
import { ReplySkeleton } from '@/components/ReplySkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';

interface ReplyViewProps {
  conversation: ConversationContext;
  tones: ReplyTone[];
  onTones: (tones: ReplyTone[]) => void;
  replies: GeneratedReply[];
  busy: boolean;
  error: string | null;
  onGenerate: () => void;
  onInsert: (text: string) => Promise<void>;
}

export function ReplyView({
  conversation,
  tones,
  onTones,
  replies,
  busy,
  error,
  onGenerate,
  onInsert,
}: ReplyViewProps) {
  async function insert(text: string) {
    try {
      await onInsert(text);
      toast.success(conversation.canInsert ? 'Inserted into the composer' : 'Copied — this page has no composer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Insert failed');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <TonePicker selected={tones} onChange={onTones} />
      <div className="flex gap-2">
        <Button className="flex-1" variant="accent" disabled={busy} onClick={onGenerate}>
          <Sparkles className="h-4 w-4" />
          {busy ? 'Generating…' : 'Generate replies'}
        </Button>
        <Button variant="outline" size="icon" disabled={busy || replies.length === 0} onClick={onGenerate} aria-label="Regenerate">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {error ? <ErrorBanner message={error} /> : null}
      {busy && replies.length === 0 ? <ReplySkeleton /> : null}
      {replies.length === 0 && !busy ? (
        <EmptyState
          title="No replies yet"
          body="Pick the tones you want, then generate. ReplyMe reads the open thread and writes as you."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              canInsert={conversation.canInsert}
              onInsert={insert}
            />
          ))}
        </div>
      )}
    </div>
  );
}
