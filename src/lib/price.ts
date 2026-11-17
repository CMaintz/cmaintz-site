import type { Lang } from '../i18n/ui';
import { estimate } from './assistant-estimate';

export const formatDkk = (dkk: number, lang: Lang) => `${dkk.toLocaleString(lang === 'da' ? 'da-DK' : 'en-GB')} DKK`;

/** The "from" price shown on a service: the low end of the smallest estimate, ex. VAT. */
export function fromPriceDkk(serviceId: string): number | undefined {
  const e = estimate({ service: serviceId, size: 'small' });
  return 'dkk' in e ? e.dkk.low : undefined;
}
