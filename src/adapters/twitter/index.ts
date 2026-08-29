import meta from './meta.json';
import { TwitterAdapter } from './adapter';

export { meta };
export function createAdapter() {
  return new TwitterAdapter();
}
