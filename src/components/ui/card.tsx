import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-none',
        className,
      )}
      {...props}
    />
  );
}
