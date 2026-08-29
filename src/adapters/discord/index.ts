import meta from './meta.json';
import { DiscordAdapter } from './adapter';

export { meta };
export function createAdapter() {
  return new DiscordAdapter();
}
