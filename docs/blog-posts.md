# Blog posts

Posts in `src/content/blog/` have two editors: a person in an IDE, and Keystatic at `/keystatic`, which parses the MDX and writes it back out. Write every post in the subset Keystatic round-trips. `src/keystatic.test.ts` opens and saves each post and fails the gate when one won't open or when a save changes a code fence opener or a component tag.

## The editor's subset

- Plain Markdown: headings, lists, tables, links, images, blockquotes and code fences. Fence meta such as `title="..."` and `{3}` is kept.
- Diagrams: a `mermaid` code fence.
- The components registered under `content.components` in `keystatic.config.ts`, for anything Markdown can't express:
  - Callouts: `<Callout type="note|tip|warn" title="...">...</Callout>`.
  - Math: `<Math expr="..." />` for a block, `<InlineMath expr="..." />` inline. The TeX goes in a plain string attribute, without `$` delimiters.
  - Keys: `<kbd>Ctrl</kbd>`.

Everything else stops a post opening in the editor: MDX `{...}` expressions (`{/* comments */}` included), `$` math, `import`/`export` lines (`PostView.astro` supplies the components), and raw HTML other than `<kbd>`. Keep notes and TODOs in an issue or `.local/`.

## Adding a component

A component lives in three places that change together:

1. `keystatic.config.ts`, so the editor can parse and insert it.
2. The `components` passed to `<Content>` in `src/views/PostView.astro`, so the site renders it.
3. `devtoMarkdown` in `src/lib/crosspost.ts`, when dev.to can't render it: convert it to Markdown or a dev.to Liquid tag, with a case in `crosspost.test.ts`.

## Front matter

- The filename is the post's id and URL slug: `src/content/blog/<slug>.mdx` is served at `/blog/<slug>`, or `/da/blog/<slug>` with `lang: da`. Use a lowercase, hyphenated slug in the post's own language; the editor derives it from the title the same way. Renaming a published post breaks its URL, and cross-posting then creates a second dev.to article, since articles are matched by canonical URL.
- `lang` and `translation`: an English post and its Danish version are two files. Each sets `translation` to the other's slug, and the Danish one sets `lang: da`. `src/lib/translations.test.ts` fails when a pair doesn't point both ways.
- `cover`: the image goes in `src/assets/blog/`, referenced as `cover: ../../assets/blog/<file>`, the path the editor writes.
- `tags`: ids from `src/data/tags.ts`. A new tag goes there first, with its dev.to equivalent if one is well followed. Its header says how the list's order picks a post's four dev.to tags.
- `areas`: ids from `src/data/areas.ts`.
- `crosspost: [devto]` publishes to dev.to after the post reaches `main` and is live (not `draft`, `pubDate` not in the future). Later pushes that change the post update the article.

## Upgrading Keystatic

`patches/@keystatic+core+*.patch` fixes Keystatic cutting fence meta to its first word on save, and targets one hashed chunk of a single version. After a `@keystatic/core` bump, `npm ci` fails until the patch is regenerated with `npx patch-package @keystatic/core`, or deleted if the new version fixed the bug. The round-trip test shows which.
