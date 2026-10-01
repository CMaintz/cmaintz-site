---
title: MovieWheel
glyph: ◔
tagline:
  en: Spin a wheel, settle movie night
  da: Drej hjulet og afgør filmaftenen
summary:
  en: Filter, spin a 12-slot wheel and get a title plus where it streams. React on Cloudflare Workers, with the TMDB key kept server-side behind a rate-limited proxy that checks origin and path.
  da: Filtrér, drej et hjul med 12 felter og få en titel plus hvor den streames. React på Cloudflare Workers, hvor TMDB-nøglen bliver på serveren bag en rate-limited proxy, der tjekker origin og path.
areas: [platform]
category: personal
order: 10
featured: true
role: Sole developer
context: Personal project · ReelScout spin-off
start: 2026-05
end: 2026-06
stack: [React 19, TypeScript, Vite, TanStack Query, Cloudflare Workers, Vitest]
repos: [movie-wheel]
demo: https://movie-wheel.cmaintz-site.workers.dev
live: https://movie-wheel.cmaintz-site.workers.dev
---

## Highlights

- **Server-side TMDB proxy** - one platform-neutral core behind a Cloudflare Worker (a Vercel adapter works too). It injects the key, 403s foreign origins, allow-lists paths segment by segment, and rate-limits to 60/min per IP
- **Genre combos** - Rom-Com, Horror Comedy, Action Thriller and more, each requiring both genres. TMDB can't express "(A and B) or C", so every selection is queried separately and mixed
- **Tested wheel math** - landing angles are pure functions with a property test, which caught repeat spins landing on the wrong poster. 111 Vitest tests, ~94% line coverage, CI on every PR
- **Spin as a state machine** - `idle → loading → spinning → stopped`, eased with easeOutCubic, posters preloaded with `crossOrigin` so they can be drawn on the canvas
