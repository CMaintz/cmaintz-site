import { en } from './en';
import { da } from './da';

const locales = ['en', 'da'] as const;
export type Lang = (typeof locales)[number];
const defaultLang: Lang = 'en';

const ui = { en, da };

export type UIKey = keyof (typeof ui)['en'];

export function useT(lang: Lang) {
  return (key: UIKey) => ui[lang][key] ?? ui.en[key];
}

/**
 * Pages are canonical with a trailing slash ("/about/"); files ("/cv.pdf") keep their form.
 * Query strings and fragments are kept: "/about#values" -> "/about/#values".
 */
export function withSlash(path: string) {
  const [, pathname, rest] = path.match(/^([^?#]*)(.*)$/s)!;
  if (pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(pathname)) return path;
  return `${pathname}/${rest}`;
}

/** Prefix an unlocalized path ("/about") for the given locale, in its canonical form ("/da/about/"). */
export function localize(path: string, lang: Lang) {
  const clean = withSlash(path.startsWith('/') ? path : `/${path}`);
  if (lang === defaultLang) return clean;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

/** Strip a locale prefix from a pathname: "/da/about" -> "/about". */
export function unlocalize(pathname: string) {
  const m = pathname.match(/^\/(da)(\/.*)?$/);
  return m ? m[2] || '/' : pathname;
}

export function formatDate(date: Date, lang: Lang, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }) {
  return date.toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-GB', opts);
}
