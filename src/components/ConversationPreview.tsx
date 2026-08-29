import { Mail } from 'lucide-react';
import type { ConversationContext } from '@/types/conversation';
import { Badge } from '@/components/ui/badge';

interface ConversationPreviewProps {
  conversation: ConversationContext;
}

export function ConversationPreview({ conversation }: ConversationPreviewProps) {
  const last = conversation.messages.at(-1);
  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{conversation.title}</p>
          <p className="truncate text-xs text-zinc-500">
            {conversation.participants.slice(0, 3).join(', ') || 'Open thread'}
          </p>
        </div>
        <Badge className="shrink-0 gap-1">
          <Mail className="h-3 w-3" />
          {conversation.platformName}
        </Badge>
      </div>
      {last ? (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{last.author}: </span>
          {last.body}
        </p>
      ) : null}
    </div>
  );
}
