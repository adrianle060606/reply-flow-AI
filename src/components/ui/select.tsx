import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-xl border border-zinc-200 bg-white/80 px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
