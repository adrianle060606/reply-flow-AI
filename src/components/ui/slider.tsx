import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Slider({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn('h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-violet-600 dark:bg-zinc-700', className)}
      {...props}
    />
  );
}
