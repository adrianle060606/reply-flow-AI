import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100',
        className,
      )}
      {...props}
    />
  );
}
