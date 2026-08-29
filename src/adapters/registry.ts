import type { PlatformModule } from '@/types/messaging-platform';
import { urlMatches } from '@/utils/match-pattern';

const modules = import.meta.glob<PlatformModule>('./*/index.ts', { eager: true });

export function allPlatformModules(): PlatformModule[] {
  return Object.entries(modules)
    .filter(([path]) => !path.includes('/shared/'))
    .map(([, mod]) => mod)
    .filter((mod): mod is PlatformModule => Boolean(mod?.meta && mod.createAdapter));
}

export function moduleForUrl(href: string): PlatformModule | undefined {
  return allPlatformModules().find((mod) => urlMatches(mod.meta.matches, href));
}

export function createAdapterForUrl(href: string) {
  const mod = moduleForUrl(href);
  return mod ? mod.createAdapter() : undefined;
}

export function collectMatches(): string[] {
  return [...new Set(allPlatformModules().flatMap((mod) => mod.meta.matches))];
}
