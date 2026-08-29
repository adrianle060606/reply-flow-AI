import meta from './meta.json';
import { SlackAdapter } from './adapter';

export { meta };
export function createAdapter() {
  return new SlackAdapter();
}
