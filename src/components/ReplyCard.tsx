import { Copy, Check, CornerDownLeft } from 'lucide-react';
import { useState } from 'react';
import type { GeneratedReply } from '@/types/ai-provider';
import { TONE_COPY } from '@/constants/tones';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReplyCardProps {
  reply: GeneratedReply;
  canInsert: boolean;
  onInsert: (text: string) => Promise<void> | void;
}

export function ReplyCard({ reply, canInsert, onInsert }: ReplyCardProps) {
  const [copied, setCopied] = useState(false);
  const copy = TONE_COPY[reply.tone];

  async function handleCopy() {
    await navigator.clipboard.writeText(reply.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <Card className="rise space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold tracking-tight">{copy.label}</p>
          <p className="text-xs text-zinc-500">{copy.hint}</p>
        </div>
        <Badge>{reply.provider}</Badge>
      </div>
      <p className="whitespace-pre-wrap text-[13px] leading-6 text-zinc-800 dark:text-zinc-200">
        {reply.text}
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button
          variant="accent"
          size="sm"
          disabled={!canInsert}
          onClick={() => void onInsert(reply.text)}
        >
          <CornerDownLeft className="h-3.5 w-3.5" />
          Insert
        </Button>
      </div>
    </Card>
  );
}
