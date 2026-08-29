import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { ReplySkeleton } from '@/components/ReplySkeleton';

interface SummaryViewProps {
  summary: string;
  busy: boolean;
  error: string | null;
  onSummarize: () => void;
}

export function SummaryView({ summary, busy, error, onSummarize }: SummaryViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button variant="accent" disabled={busy} onClick={onSummarize}>
        {busy ? 'Summarizing…' : summary ? 'Refresh summary' : 'Summarize thread'}
      </Button>
      {error ? <ErrorBanner message={error} /> : null}
      {busy && !summary ? <ReplySkeleton /> : null}
      {summary ? (
        <Card>
          <p className="text-[13px] leading-6 text-zinc-800 dark:text-zinc-200">{summary}</p>
          <p className="mt-3 text-[11px] text-zinc-500">
            Saved as conversation memory. Later replies will use this context.
          </p>
        </Card>
      ) : !busy ? (
        <EmptyState
          title="No summary yet"
          body="Summaries are stored per conversation so ReplyMe remembers the thread between generations."
        />
      ) : null}
    </div>
  );
}
