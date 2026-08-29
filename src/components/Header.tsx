import { Sparkles } from 'lucide-react';

export function Header({ onOpenSettings }: { onOpenSettings?: () => void }) {
  return (
    <header className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">ReplyMe</p>
          <p className="text-[11px] text-zinc-500">Communication copilot</p>
        </div>
      </div>
      {onOpenSettings ? (
        <button
          type="button"
          onClick={onOpenSettings}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          Settings
        </button>
      ) : (
        <span className="text-[11px] text-zinc-400">v1.0</span>
      )}
    </header>
  );
}
