import meta from './meta.json';
import { GmailAdapter } from './adapter';

export { meta };
export function createAdapter() {
  return new GmailAdapter();
}
