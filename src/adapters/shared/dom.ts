export function qs<T extends Element>(
  root: ParentNode,
  selector: string,
): T | null {
  return root.querySelector<T>(selector);
}

export function qsa<T extends Element>(root: ParentNode, selector: string): T[] {
  return [...root.querySelectorAll<T>(selector)];
}

export function firstText(el: Element | null): string {
  if (!el) return '';
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function visible(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest('[aria-hidden="true"]')) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
}

export function firstMatching(selectors: readonly string[], root: ParentNode = document): HTMLElement | null {
  for (const selector of selectors) {
    const found = qs<HTMLElement>(root, selector);
    if (found) return found;
  }
  return null;
}
