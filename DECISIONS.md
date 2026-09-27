# Decisions log

Choices made on your behalf while you were away. Each one says what I chose, why, and how to change it. Items marked **CONFIRM** need a quick check from you before going live.

## Project & stack

- **Name:** `cmaintz-site` (folder, npm package, Cloudflare Worker, GitHub repo). It's a personal professional site, not only a portfolio.
- **Photo:** your photo from `tech_lexicon/about`, cropped gently to 4:5 (head and shoulders kept), 640x800 WebP + JPEG in `public/img/`, shown in the CRT frame on /about with faint scanlines that clear on hover.
- **Formatter:** your global Claude Code hook `~/.claude/hooks/auto-format.sh` runs prettier after each file edit. I added `.prettierrc` (single quotes, 140 columns) so it matches this codebase.

| Decision                                                                   | Why                                                                                                                                                             | Change it                                                                                                                                                                  |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Location: `Projects/WebstormProjects/cmaintz-site`                            | The IDE-named folders look like your intended sorting scheme and a web project belongs under WebStorm.                                                          | Move the folder; nothing is path-dependent.                                                                                                                                |
| **Astro 7** + MDX, static by default, one on-demand route (`/api/contact`) | You already use Astro (Tech Atlas); ships near-zero JS; best-in-class content tooling.                                                                               | -                                                                                                                                                                          |
| **Cloudflare Workers** hosting via `@astrojs/cloudflare`                   | Free tier covers this site; Astro's docs now recommend it; one platform for hosting, Turnstile, analytics and domains.                                          | Swap the adapter for Vercel/Netlify if preferred.                                                                                                                          |
| **Hand-written CSS**, no Tailwind                                          | Four very different visual systems (retro + three previews) are easier to keep isolated with scoped CSS and tokens.                                             | -                                                                                                                                                                          |
| **MDX in the repo** for the blog, not a CMS                                | You leaned CMS but deferred to the agents; the research recommended MDX. It's free, versioned and has no moving parts.                                          | **Upgrade path:** Keystatic (git-based, free, Astro-native) gives you a web editor at `/keystatic` that commits to the repo. Add it once you want to write from a browser. |
| Self-hosted fonts via Fontsource                                           | No third-party font requests (GDPR; the Munich Google Fonts ruling).                                                                                            | -                                                                                                                                                                          |
| `session: false` in Astro config                                           | No server sessions are used; avoids provisioning a KV namespace.                                                                                                | -                                                                                                                                                                          |
| Foundry **not** wired in                                                   | You asked to hold off while it's restructured. There is a plain CI build (`.github/workflows/ci.yml`) plus `npm run check` (types + your function-length rule). | Replace with Foundry's reusable workflow later.                                                                                                                            |

## Visual design

- **Main site = retro-future / CRT**, modelled on typesafe.ai: near-black `#121212` + off-white, pink phosphor accent `#F386A1` (typesafe's own pink), teal and magenta secondaries. Old-school "window" boxes with title bars and hard offset shadows, pixel font (Silkscreen) for labels, JetBrains Mono for UI, Hanken Grotesk for reading text (free stand-in for typesafe's commercial Die Grotesk).
- **Pixelated animated background**: a dithered plasma field rendered at 1/7 resolution and upscaled with `image-rendering: pixelated`; reacts to the cursor; faded behind the reading column; capped at 24 fps; pauses in hidden tabs; static under reduced motion or when CRT effects are off.
- **CRT layer**: scanlines + vignette, toggleable from the header (monitor icon) and the command palette; defaults off for users with reduced motion.
- **Light mode ("paper")** alongside the default dark; follows the OS the first time, then remembers the toggle.
- **Ctrl/Cmd + K** command palette (also `/`) with fuzzy search over pages, projects, posts and actions.
- The three previews (`/editorial`, `/technical`, `/bold`) use the exact palettes and font pairs from the design research, follow the OS light/dark setting, show the same content, are `noindex` and excluded from the sitemap.

## Content

- **Areas taxonomy:** posts, projects and services carry `areas` (dx, devops, platform, ai), defined in `src/data/areas.ts`. Pages show them as chips linking to `/projects#<area>`, and /projects can filter by them. This is the groundwork for per-area "What I do" pages.
- **Tech Atlas** (renamed from "Atlas", URL `/projects/tech-atlas`) refuses to render inside iframes on purpose (its layout hides itself when framed, protecting account actions). The project page therefore shows a recorded 15-second clip of the explorer (2D force layout, layout by depth, 3D) plus a "Live" button to the explorer. Re-record with `node scripts/record-tech-atlas.mjs`.

- Project write-ups come from `PORTFOLIO.md`; CV facts from your `MASTER_BRUTTO_CV.md` (which overrides PORTFOLIO.md where they differ). I followed its conventions: hyphens only, no skill levels, **provider-agnostic AI wording** (no "Gemini"/"OpenAI" in copy), early-career positioning, and **no unmeasured claims** (the room-visualisation conversion effect is phrased as intent).
- Atlas (tech-atlas) was added from its GitHub README, including its live site as an embedded demo.
- WEXO dates: Aug 2025 - Jan 2026 (confirmed; PORTFOLIO.md's Aug-Dec was wrong).
- **CONFIRM**: academic project dates are marked "approx." exactly as in PORTFOLIO.md (KAS, Sall Whisky, TimeRegistry, StableHand, Birdie, Yatzyweb, Maze, EmployeeApp, Email Template Preview).
- **CONFIRM**: TimeRegistry and StableHand have no public repos; they show "source is private". Publish them or leave as is.
- Left out: the private 2024-25 course repos (URLWebApp, PRO1, etc.) and the `jobbuddy-lite` fork.
- Personal details: only "Aarhus" is shown. The family paragraph from the master CV is **not** used; the "first website at 13" fun fact is on /about.
- Retail leadership (Netto, Kiwi) is shown collapsed on /about and at the end of the CV, as supporting evidence of leadership.
- Danish: all UI, the homepage, /about, the CV, services and project summaries are translated. Full project case studies and blog posts are English only, with a note on the Danish pages.
- **Blog posts are drafts in your voice** - please read both before publishing: "One rule set, three placements" (built from FOUNDRY-DESCRIPTION.md) and "Hello, world" (also demos every blog feature). To hide one, set `draft: true`.
- /now lists your DEVEX work, what you're looking for (Aarhus or remote, confirmed) and current side projects.
- /uses is built from the tools section of your master CV.

## Services & pricing

- **Hourly from 400 DKK ex. VAT** (your call: early-career positioning), free 30-minute intro call. For reference, 2026 Danish freelance rates run roughly 600-800 DKK/h for juniors and 700-1,500 DKK/h overall.
- Fixed-price "from" anchors scaled to the same rate: quality-gate setup 7,000 DKK, AI integration 9,000 DKK, AI-assisted dev enablement 4,500 DKK; Shopware/full-stack/other quoted per job.
- One place to change it: `HOURLY_RATE_DKK` and the `fixed(...)` values in `src/data/services.ts`.
- The services list includes Go and Rust because you listed them; the CV does not.

## Features

- **GitHub integration**: `npm run sync` snapshots all public non-fork repos (stars, languages, topics, push dates) plus GitHub-rendered READMEs into `src/data/github.json`. Project pages show a language bar, topics, and a collapsible README. A weekly CI job opens a PR with a fresh snapshot. Builds never call GitHub, so they're deterministic and offline-safe.
- **Interactive demos**: click-to-load, sandboxed iframes on project pages that have a `demo:` URL (ReelScout today; Tech Atlas refuses to be framed, so it shows a recorded clip instead). Illux links to the live product page ("visualiser i flere rum") rather than embedding a client's shop. To add more, deploy the demo somewhere frameable and set `demo:` in the project's frontmatter. Java/PHP/.NET projects would need hosting (e.g. a free-tier container) and weren't attempted.
- **Illux clip**: I tried to record the room visualiser on illux.dk twice (Playwright can't download its video tool here, so via the browser's screencast). Both times the shop itself answered **"Kunne ikke starte komposition"** after rooms were selected, so no clip was made and I stopped rather than keep hitting their production system. Possibly bot detection, possibly a real outage worth mentioning to WEXO/Illux. The site is ready for a clip: record it yourself (ScreenToGif, or Win+Alt+R with Xbox Game Bar), then `npm run clip -- <file> illux-visualiser` and add `video: /media/illux-visualiser` to `illux-product-ai.md`. It plays as a silent loop, only while visible, and shows the poster under reduced motion.
- **Comments: Supabase** (your choice). Sign in with GitHub or Google (LinkedIn optional); the provider list is config (`PUBLIC_SUPABASE_PROVIDERS`). Author name/avatar are filled server-side from the login so they can't be faked, row-level security limits users to reading visible comments and deleting their own, there's a rate limit of 5 comments per 10 minutes, and moderation is a `status` flag in the Table Editor. All of that is tested against real Postgres by `npm run test:comments` (11 checks). A keep-alive job (every 3 days) stops the free project from pausing. supabase-js only loads on post pages when the comments scroll into view. giscus remains as a fallback if only its IDs are set.
- **Contact form**: posts to `/api/contact` (Cloudflare Worker) -> Resend email to your inbox, with reply-to set to the sender. Spam: honeypot, Astro's same-origin check, optional Cloudflare Turnstile. Works without JavaScript (redirects back with a status). Without keys it answers `503 not_configured` and shows your email instead.
- **CV**: `/about` (profile, timeline, skills), `/cv` (printable, ATS-friendly) and PDFs (`/cv.pdf`, `/cv-da.pdf`) generated from the same data file by printing `/cv` with Edge via Playwright (Typst wasn't installed; this keeps one source of truth).
- **Extra pages**: `/now`, `/uses`, `/search` (Pagefind, static), RSS at `/rss.xml`, sitemap, 404, JSON-LD (Person + BlogPosting), hreflang alternates, and a generated share image (`public/og.png`).
- **Analytics**: Cloudflare Web Analytics, cookieless, only if a token is set.

## Things I could not verify

- Real email delivery via Resend (no API key). Every other path of the API was exercised in dev and in the Workers runtime (`astro preview`).
- Real sign-in and a real comment round-trip (needs your Supabase project and OAuth apps). The UI was tested in a browser against a mock API, including an XSS attempt, and the SQL against real Postgres.
- The CI workflow (`.github/workflows/ci.yml`) has never run: nothing is pushed yet, so your first push is its first test.
- Deploying to Cloudflare (needs your login). `npm run build` and `astro preview` in the Workers runtime both work locally.

## Possible next steps

- Per-post OG images, Keystatic for browser editing, Danish translations of the case studies.
