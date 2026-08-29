import { PopupApp } from '@/popup/App';
import { SAMPLE_CONVERSATIONS } from '@/preview/sample-data';
import { previewConversation, setPreviewConversation } from '@/preview/install-chrome';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export function PreviewApp() {
  const [activeId, setActiveId] = useState(previewConversation().conversationId);

  function switchThread(id: string) {
    const next = SAMPLE_CONVERSATIONS.find((item) => item.conversationId === id);
    if (!next) return;
    setPreviewConversation(next);
    setActiveId(id);
    window.location.reload();
  }

  return (
    <div className="reply-shell min-h-screen text-zinc-900 dark:text-zinc-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_400px] lg:py-16">
        <section className="flex flex-col justify-center gap-6">
          <Badge className="w-fit">Chrome extension · Manifest V3</Badge>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              ReplyMe writes the next message.
              <span className="block text-zinc-500">You keep the voice.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              An AI communication copilot for Gmail, Slack, WhatsApp, Discord, LinkedIn, Messenger, X, and Google Messages.
              Platforms and providers are plugins. Adding one is a new folder.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_CONVERSATIONS.map((item) => (
              <Button
                key={item.conversationId}
                size="sm"
                variant={item.conversationId === activeId ? 'primary' : 'outline'}
                onClick={() => switchThread(item.conversationId)}
              >
                {item.platformName}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => window.open('/options.html', '_self')}>Open settings</Button>
            <Button variant="outline" onClick={() => window.open('/popup.html', '_self')}>
              Popup only
            </Button>
          </div>
          <ul className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Clean architecture: domain, application, infrastructure, presentation.</li>
            <li>API keys never leave the service worker. Messages are Zod-validated.</li>
            <li>Mock provider works offline. OpenAI, Gemini, Claude, OpenRouter, DeepSeek, Ollama plug in.</li>
          </ul>
        </section>
        <section className="flex justify-center lg:justify-end">
          <div className="w-[380px] overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white/70 shadow-[0_30px_80px_-32px_rgba(24,24,27,0.55)] dark:border-white/10 dark:bg-zinc-950/80">
            <div className="flex items-center gap-1.5 border-b border-zinc-200/70 px-4 py-2 dark:border-white/10">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="ml-2 text-[11px] text-zinc-400">ReplyMe · extension popup</span>
            </div>
            <PopupApp />
          </div>
        </section>
      </div>
    </div>
  );
}
