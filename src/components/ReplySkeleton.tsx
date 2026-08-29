import { Skeleton } from '@/components/ui/skeleton';

export function ReplySkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((key) => (
        <div key={key} className="space-y-2 rounded-2xl border border-zinc-200/80 p-4 dark:border-white/10">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
