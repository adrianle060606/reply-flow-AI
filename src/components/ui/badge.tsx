import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300',
        className,
      )}
      {...props}
    />
  );
}
