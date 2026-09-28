import { en } from './en';
import { da } from './da';

export const locales = ['en', 'da'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';

export const ui = { en, da };

export type UIKey = keyof (typeof ui)['en'];

export function useT(lang: Lang) {
  return (key: UIKey) => ui[lang][key] ?? ui.en[key];
}

/** Prefix an unlocalized path ("/about") for the given locale. */
export function localize(path: string, lang: Lang) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

/** Strip a locale prefix from a pathname: "/da/about" -> "/about". */
export function unlocalize(pathname: string) {
  const m = pathname.match(/^\/(da)(\/.*)?$/);
  return m ? m[2] || '/' : pathname;
}

export function langFromUrl(url: URL): Lang {
  return url.pathname.startsWith('/da/') || url.pathname === '/da' ? 'da' : 'en';
}

export function formatDate(date: Date, lang: Lang, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }) {
  return date.toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-GB', opts);
}
