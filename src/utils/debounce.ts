export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  waitMs: number,
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const wrapped = ((...args: never[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  }) as T & { cancel: () => void };

  wrapped.cancel = () => {
    if (timer) clearTimeout(timer);
  };

  return wrapped;
}
