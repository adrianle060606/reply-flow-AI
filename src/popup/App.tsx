import { useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Header } from '@/components/Header';
import { TabBar, type PopupTab } from '@/components/TabBar';
import { ConversationPreview } from '@/components/ConversationPreview';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { ReplyView } from '@/popup/views/ReplyView';
import { ToolsView } from '@/popup/views/ToolsView';
import { SummaryView } from '@/popup/views/SummaryView';
import { useConversation } from '@/hooks/use-conversation';
import { useSettings } from '@/hooks/use-settings';
import { useCopilot } from '@/hooks/use-copilot';
import { useTheme } from '@/hooks/use-theme';
import type { ReplyTone } from '@/constants/tones';

export function PopupApp() {
  const { conversation, loading, error, refresh } = useConversation();
  const { settings } = useSettings();
  const copilot = useCopilot();
  useTheme(settings.theme);
  const [tab, setTab] = useState<PopupTab>('reply');
  const [tones, setTones] = useState<ReplyTone[]>([settings.defaultTone]);

  const selectedTones = useMemo(
    () => (tones.length ? tones : [settings.defaultTone]),
    [tones, settings.defaultTone],
  );

  function openSettings() {
    if (chrome?.runtime?.openOptionsPage) chrome.runtime.openOptionsPage();
    else window.open('/options.html', '_blank');
  }

  async function insert(text: string) {
    const result = await copilot.insert(text);
    if (!result.inserted) {
      await navigator.clipboard.writeText(text);
      toast.message('Copied to clipboard');
    }
  }

  return (
    <div className="reply-shell flex min-h-[560px] w-[380px] flex-col gap-3 p-4 text-zinc-900 dark:text-zinc-50">
      <Toaster position="top-center" richColors />
      <Header onOpenSettings={openSettings} />
      {conversation ? <ConversationPreview conversation={conversation} /> : null}
      {loading ? <p className="text-xs text-zinc-500">Reading the open conversation…</p> : null}
      {!loading && error ? (
        <EmptyState
          title="No conversation detected"
          body={error}
          action={
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              Scan again
            </Button>
          }
        />
      ) : null}
      {conversation ? (
        <>
          <TabBar value={tab} onChange={setTab} />
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pr-0.5">
            {tab === 'reply' ? (
              <ReplyView
                conversation={conversation}
                tones={selectedTones}
                onTones={setTones}
                replies={copilot.replies}
                busy={copilot.busy}
                error={copilot.error}
                onGenerate={() => void copilot.generate(conversation, selectedTones)}
                onInsert={insert}
              />
            ) : null}
            {tab === 'tools' ? (
              <ToolsView
                conversation={conversation}
                busy={copilot.busy}
                error={copilot.error}
                suggestions={copilot.suggestions}
                onRewrite={copilot.rewrite}
                onFollowUps={() => void copilot.followUps(conversation)}
                onIcebreakers={() => void copilot.icebreakers(conversation)}
                onInsert={insert}
              />
            ) : null}
            {tab === 'summary' ? (
              <SummaryView
                summary={copilot.summary}
                busy={copilot.busy}
                error={copilot.error}
                onSummarize={() => void copilot.summarize(conversation)}
              />
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
