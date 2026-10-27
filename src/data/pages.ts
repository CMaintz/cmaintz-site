// The site's top-level pages, unlocalized. The command palette lists them and
// the site assistant gets them, with `about`, as its map of the site.
export const SITE_PAGES = [
  { path: '/', about: 'home' },
  { path: '/about', about: 'background and experience' },
  { path: '/what-i-do', about: 'focus areas; /what-i-do/<area> for each' },
  { path: '/projects', about: 'all projects; /projects/<id> for each' },
  { path: '/blog', about: 'posts' },
  { path: '/services', about: 'services, packages and prices' },
  { path: '/start', about: 'four-question wizard that recommends a starting point' },
  { path: '/faq', about: 'frequently asked questions' },
  { path: '/contact', about: 'contact form' },
  { path: '/now', about: 'what he is doing now' },
  { path: '/uses', about: 'tools and setup' },
  { path: '/cv', about: 'CV (also /cv.pdf)' },
  { path: '/search', about: 'site search' },
] as const;
