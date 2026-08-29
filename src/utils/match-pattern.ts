/**
 * Chrome match-pattern subset used by ReplyMe adapters.
 * Supports `https://host/path*` and `https://*.host/path*`.
 */
export function urlMatches(patterns: readonly string[], href: string): boolean {
  return patterns.some((pattern) => matchPattern(pattern, href));
}

export function matchPattern(pattern: string, href: string): boolean {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return false;
  }

  const parsed = parseChromePattern(pattern);
  if (!parsed) return false;
  if (parsed.scheme !== '*' && parsed.scheme !== url.protocol.replace(':', '')) return false;
  if (!hostAllowed(parsed.host, url.hostname)) return false;
  return pathAllowed(parsed.path, url.pathname);
}

function parseChromePattern(pattern: string): { scheme: string; host: string; path: string } | null {
  const match = pattern.match(/^(\*|https?):\/\/([^/]+)(\/.*)?$/);
  if (!match) return null;
  const scheme = match[1];
  const host = match[2];
  const path = match[3] ?? '/*';
  if (!scheme || !host) return null;
  return { scheme, host, path };
}

function hostAllowed(pattern: string, hostname: string): boolean {
  if (pattern === '*') return true;
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(2);
    return hostname === suffix || hostname.endsWith(`.${suffix}`);
  }
  return hostname === pattern;
}

function pathAllowed(pattern: string, pathname: string): boolean {
  if (pattern === '/*' || pattern === '*') return true;
  if (pattern.endsWith('*')) {
    return pathname.startsWith(pattern.slice(0, -1));
  }
  return pathname === pattern;
}
