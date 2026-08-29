import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70',
  {
    variants: {
      variant: {
        primary:
          'bg-zinc-950 text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200',
        accent:
          'bg-violet-600 text-white shadow-[0_8px_24px_-12px_rgba(139,92,246,0.9)] hover:bg-violet-500',
        ghost:
          'bg-transparent text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-300 dark:hover:bg-white/8',
        outline:
          'border border-zinc-200 bg-white/70 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10',
        danger: 'bg-red-600 text-white hover:bg-red-500',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
