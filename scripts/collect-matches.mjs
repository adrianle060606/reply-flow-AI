import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function collectContentMatches(root) {
  const adaptersDir = resolve(root, 'src/adapters');
  const matches = [];
  for (const name of readdirSync(adaptersDir, { withFileTypes: true })) {
    if (!name.isDirectory() || name.name.startsWith('.') || name.name === 'shared') continue;
    const metaPath = resolve(adaptersDir, name.name, 'meta.json');
    if (!existsSync(metaPath)) continue;
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    if (Array.isArray(meta.matches)) {
      matches.push(...meta.matches);
    }
  }
  return [...new Set(matches)];
}
