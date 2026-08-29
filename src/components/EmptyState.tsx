import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  body: string;
  action?: ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-600">
        <Inbox className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">{body}</p>
      </div>
      {action}
    </div>
  );
}
