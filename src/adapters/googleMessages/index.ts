import meta from './meta.json';
import { GoogleMessagesAdapter } from './adapter';

export { meta };
export function createAdapter() {
  return new GoogleMessagesAdapter();
}
