import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-zinc-200 bg-white/80 px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100',
        className,
      )}
      {...props}
    />
  );
}
