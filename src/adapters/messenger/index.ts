import meta from './meta.json';
import { MessengerAdapter } from './adapter';

export { meta };
export function createAdapter() {
  return new MessengerAdapter();
}
