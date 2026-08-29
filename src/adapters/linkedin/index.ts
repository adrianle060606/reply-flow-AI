import meta from './meta.json';
import { LinkedInAdapter } from './adapter';

export { meta };
export function createAdapter() {
  return new LinkedInAdapter();
}
