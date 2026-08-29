interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
      {message}
    </div>
  );
}
