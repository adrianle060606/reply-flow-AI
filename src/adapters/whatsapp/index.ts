import meta from './meta.json';
import { WhatsAppAdapter } from './adapter';

export { meta };
export function createAdapter() {
  return new WhatsAppAdapter();
}
