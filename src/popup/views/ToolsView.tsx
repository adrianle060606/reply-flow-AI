import { useState } from 'react';
import { toast } from 'sonner';
import type { ConversationContext } from '@/types/conversation';
import type { RewriteAction, RewriteInstruction } from '@/types/ai-provider';
import type { ReplyTone } from '@/constants/tones';
import { REPLY_TONES } from '@/constants/tones';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ErrorBanner';

const ACTIONS: { id: RewriteAction; label: string }[] = [
  { id: 'grammar', label: 'Fix grammar' },
  { id: 'rewrite', label: 'Rewrite' },
  { id: 'shorten', label: 'Shorten' },
  { id: 'expand', label: 'Expand' },
  { id: 'tone', label: 'Change tone' },
  { id: 'translate', label: 'Translate' },
  { id: 'explain', label: 'Explain' },
];

interface ToolsViewProps {
  conversation: ConversationContext;
  busy: boolean;
  error: string | null;
  suggestions: string[];
  onRewrite: (text: string, instruction: RewriteInstruction) => Promise<string | undefined>;
  onFollowUps: () => void;
  onIcebreakers: () => void;
  onInsert: (text: string) => Promise<void>;
}

export function ToolsView({
  conversation,
  busy,
  error,
  suggestions,
  onRewrite,
  onFollowUps,
  onIcebreakers,
  onInsert,
}: ToolsViewProps) {
  const last = conversation.messages.at(-1)?.body ?? '';
  const [draft, setDraft] = useState(last);
  const [action, setAction] = useState<RewriteAction>('rewrite');
  const [tone, setTone] = useState<ReplyTone>('professional');
  const [language, setLanguage] = useState('Spanish');
  const [result, setResult] = useState('');

  async function run() {
    const instruction: RewriteInstruction = {
      action,
      targetTone: action === 'tone' ? tone : undefined,
      targetLanguage: action === 'translate' ? language : undefined,
    };
    const next = await onRewrite(draft, instruction);
    if (next) {
      setResult(next);
      toast.success('Draft updated');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <ErrorBanner message={error} /> : null}
      <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={5} />
      <div className="grid grid-cols-2 gap-2">
        <Select value={action} onChange={(event) => setAction(event.target.value as RewriteAction)}>
          {ACTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
        {action === 'tone' ? (
          <Select value={tone} onChange={(event) => setTone(event.target.value as typeof tone)}>
            {REPLY_TONES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        ) : null}
        {action === 'translate' ? (
          <Select value={language} onChange={(event) => setLanguage(event.target.value)}>
            {['Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Korean'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        ) : null}
      </div>
      <Button variant="accent" disabled={busy || !draft.trim()} onClick={() => void run()}>
        Apply
      </Button>
      {result ? (
        <Card className="space-y-2">
          <p className="whitespace-pre-wrap text-[13px] leading-6">{result}</p>
          <Button size="sm" onClick={() => void onInsert(result)}>
            Insert
          </Button>
        </Card>
      ) : null}
      <div className="flex gap-2">
        <Button className="flex-1" variant="outline" disabled={busy} onClick={onFollowUps}>
          Follow-ups
        </Button>
        <Button className="flex-1" variant="outline" disabled={busy} onClick={onIcebreakers}>
          Icebreakers
        </Button>
      </div>
      {suggestions.map((item) => (
        <Card key={item} className="flex items-start justify-between gap-2">
          <p className="text-[13px] leading-5">{item}</p>
          <Button size="sm" variant="ghost" onClick={() => void onInsert(item)}>
            Use
          </Button>
        </Card>
      ))}
    </div>
  );
}
