# cmaintz-site

Personal site of Christoffer Maintz: projects, blog, CV, services and contact. Built with Astro, deployed on Cloudflare Workers, in a retro-future / CRT style.

**Live:** https://maintz.dev

![The maintz.dev home page in the dark theme](docs/screenshot-home.png)

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # site + search index -> dist/
npm run preview    # Workers runtime locally
npm run check      # types, code-size rules (functions <= 18 lines, files <= 300), comments SQL tests
npm run shots      # screenshot smoke test (desktop + mobile)
```

- **SETUP.md** - domain, deploy, contact form, comments, analytics, content workflows.

## Where things live

| Path                                         | What                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `src/content/projects/*.md`                  | Project case studies (frontmatter schema in `src/content.config.ts`) |
| `src/content/blog/*.mdx`                     | Blog posts                                                           |
| `src/data/resume.ts`                         | CV data (drives /about, /cv and the PDFs)                            |
| `src/data/services.ts`                       | Services and pricing                                                 |
| `src/data/site.ts`                           | Name, email, socials                                                 |
| `src/data/github.json`                       | GitHub snapshot (`npm run sync`)                                     |
| `src/i18n/ui.ts`                             | English/Danish UI strings                                            |
| `src/views/`                                 | Page bodies shared by `/x` and `/da/x` routes                        |
| `src/styles/global.css`                      | Retro design tokens and primitives                                   |
| `scripts/`                                   | GitHub sync, CV PDF, OG image, screenshots, function-length check    |

## License

MIT, see [LICENSE](LICENSE).
