// What the contact form fills in from the link that led there: the /start
// wizard's brief, or the package or service card the visitor clicked.

export type OfferTitles = Record<'package' | 'service', Record<string, string>>;

/** Text for the message field; empty when the link carries nothing the site offers. */
export function presetText(q: URLSearchParams, offers: OfferTitles, label: string) {
  const brief = q.get('message');
  if (brief) return brief.slice(0, 2000);
  for (const kind of ['package', 'service'] as const) {
    const id = q.get(kind);
    if (id && Object.hasOwn(offers[kind], id)) return `${label} ${offers[kind][id]}\n\n`;
  }
  return '';
}
