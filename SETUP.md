# Go-live guide

Everything runs locally without any of this; each phase switches on one piece. Phases are in the order we'll do them. **You** = a step only you can do (accounts, logins, dashboards). **Claude** = I can run it once you've done yours.

Local basics:

```sh
npm install
npm run dev        # http://localhost:4321 (search only works after a build)
npm run build      # site + search index -> dist/
npm run preview    # the built site in the real Workers runtime
npm run check      # types + <=18-line functions + comments SQL security tests
```

Build-time values (`SITE_URL`, every `PUBLIC_*`) are baked in when the site is built. Put them in `.env` for local builds, and in Cloudflare's **build** variables for deploys. Changing one means rebuilding. Server secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) are Worker **secrets** and don't need a rebuild.

---

## Phase 1 - GitHub repo (Claude, with your OK - done in this session)

Public repo `CMaintz/cmaintz-site`. CI (`ci.yml`) builds and runs `npm run check` on every push.

## Phase 2 - Cloudflare account + first deploy

1. **You:** create a free account at https://dash.cloudflare.com/sign-up (skip the "add a domain" step for now).
2. **You:** run `! npx wrangler login` in this Claude session and approve in the browser.
3. **Claude:** `npm run build && npx wrangler deploy`. Wrangler prints the live URL, `https://cmaintz-site.<your-subdomain>.workers.dev`.
4. **Claude:** put that URL in `.env` as `SITE_URL=...`, rebuild, redeploy (so canonical links, RSS, sitemap and share cards point at the real host).

### Automatic deploys from GitHub (optional, recommended)

**You:** Workers & Pages -> `cmaintz-site` -> Settings -> Builds -> Connect the GitHub repo. Build command `npm run build`, deploy command `npx wrangler deploy`. Under **Build variables**, add `SITE_URL` and every `PUBLIC_*` value you use. After that, every push to `main` deploys.

## Phase 3 - Contact form (Resend)

1. **You:** sign up at https://resend.com **with `cmaintz@outlook.com`**. Until you verify a domain, Resend's test sender can only deliver to your own account address, which is exactly the inbox we want.
2. **You:** Resend -> API Keys -> Create (permission "Sending access").
3. **You:** in your own terminal (not the chat `!`): `npx wrangler secret put RESEND_API_KEY --name cmaintz-site` and paste the key when prompted.
4. **Claude:** submit the live form once and you confirm the mail arrived. This is the one path that hasn't been tested yet.

Later, with a domain: verify it in Resend, then `npx wrangler secret put CONTACT_FROM_EMAIL --name cmaintz-site` (e.g. `Website <contact@yourdomain.dk>`) and update `CONTACT_TO_EMAIL` if you get a domain mailbox.

## Phase 4 - Spam protection (Cloudflare Turnstile, optional)

1. **You:** Cloudflare dashboard -> Turnstile -> Add widget. Hostnames: the `workers.dev` host (and your domain later). Mode: Managed.
2. **You:** in your own terminal (not the chat `!`): `npx wrangler secret put TURNSTILE_SECRET_KEY --name cmaintz-site` (secret key).
3. **Claude:** add `PUBLIC_TURNSTILE_SITE_KEY=<site key>` to `.env` / build variables, rebuild, redeploy.

Without Turnstile the form still has a honeypot field and Astro's same-origin check.

## Phase 5 - Comments (Supabase)

Free tier: 2 active projects, 50,000 monthly active users, 500 MB database. Free projects **pause after 7 days without activity**. `.github/workflows/supabase-keepalive.yml` reads one row every 3 days to prevent that.

1. **You:** https://supabase.com -> New project. Name `cmaintz-site`, region **Frankfurt (eu-central-1)**, save the database password in your password manager.
2. **Claude:** apply `supabase/migrations/0001_site_comments.sql` (you paste it into SQL Editor -> New query -> Run, or I run it via the Supabase CLI after `! npx supabase login`).
3. **You:** Project Settings -> API: copy the **Project URL** and the **anon / publishable key** (both are public by design; row-level security protects the data).
4. **Claude:** add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` to `.env` / build variables and to the GitHub repo **variables** (for the keep-alive job), rebuild, redeploy.
5. **You:** Authentication -> URL Configuration:
   - Site URL: the workers.dev URL (your domain later).
   - Redirect URLs: add `http://localhost:4321/**`, `https://cmaintz-site.<subdomain>.workers.dev/**` and later `https://yourdomain.dk/**`. A missing entry here is the classic "login bounces back and nothing happens" bug.
6. **You:** sign-in providers (Authentication -> Sign In / Providers). The callback URL for all of them is `https://<project-ref>.supabase.co/auth/v1/callback`.
   - **GitHub (~5 min):** github.com -> Settings -> Developer settings -> OAuth Apps -> New. Homepage = site URL, callback = the Supabase callback. Paste Client ID + a new Client secret into Supabase.
   - **Google (~20 min):** console.cloud.google.com -> new project -> OAuth consent screen (External, app name, your email) -> Credentials -> OAuth client ID (Web). Authorised redirect URI = the Supabase callback. Paste ID + secret into Supabase.
   - **LinkedIn (~30 min, optional):** linkedin.com/developers -> Create app (needs a LinkedIn company page; you can create a simple one) -> Products -> "Sign In with LinkedIn using OpenID Connect" -> Auth tab: add the Supabase callback. In Supabase enable **LinkedIn (OIDC)**, then add `linkedin_oidc` to `PUBLIC_SUPABASE_PROVIDERS`.
   - Facebook is possible but requires Meta business verification; not worth it here.
7. **Claude:** `PUBLIC_SUPABASE_PROVIDERS=github,google` (plus `linkedin_oidc` if done), rebuild, redeploy, and we post and delete one test comment together.

**Moderation:** Supabase -> Table Editor -> `site_comments` -> set `status` to `hidden`. Hidden comments disappear from the site immediately.

## Phase 6 - Analytics (optional, 2 min)

**You:** Cloudflare -> Web Analytics -> Add site -> copy the token. **Claude:** `PUBLIC_CF_BEACON_TOKEN=<token>`, rebuild, redeploy. Cookieless, no consent banner needed.

## Phase 7 - Domain (whenever you buy one)

1. **You:** buy it (Cloudflare Registrar sells at cost; any registrar works if you point its nameservers to Cloudflare).
2. **You:** Workers & Pages -> `cmaintz-site` -> Settings -> Domains & Routes -> Add custom domain.
3. **Claude:** `SITE_URL=https://yourdomain.dk`, rebuild, redeploy; add the domain to Turnstile hostnames and Supabase redirect URLs; verify it in Resend and switch the sender address.

---

## Day-to-day

| Task                                                  | Command                                                                                                        |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| New blog post                                         | add `src/content/blog/<slug>.mdx` (see `hello-world.mdx`); `draft: true` hides it in production                |
| Refresh GitHub data + READMEs                         | `npm run sync` (CI also opens a weekly PR)                                                                     |
| Regenerate CV PDFs after editing `src/data/resume.ts` | `npm run build && npm run cv:pdf`                                                                              |
| Regenerate share images (after a new post or project) | `npm run build && npm run og && npm run build` |
| Add a looping clip to a project                       | `npm run clip -- <recording.mp4> <name> [start] [end]`, then `video: /media/<name>` in the project frontmatter |
| Redeploy the www redirect (rarely needed)             | `npx wrangler deploy --config redirect-www/wrangler.jsonc` |
| Visual / interaction smoke tests                      | `npm run build && npm run shots && npm run smoke`                                                              |
| Change pricing                                        | `HOURLY_RATE_DKK` and `fixed(...)` in `src/data/services.ts`                                                   |
