import { cn } from '@/utils/cn';

const tabs = [
  { id: 'reply', label: 'Reply' },
  { id: 'tools', label: 'Tools' },
  { id: 'summary', label: 'Summary' },
] as const;

export type PopupTab = (typeof tabs)[number]['id'];

interface TabBarProps {
  value: PopupTab;
  onChange: (tab: PopupTab) => void;
}

export function TabBar({ value, onChange }: TabBarProps) {
  return (
    <nav className="grid grid-cols-3 rounded-2xl bg-zinc-950/5 p-1 dark:bg-white/5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-xl py-2 text-xs font-medium transition',
            value === tab.id
              ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200',
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
