---
title: MovieWheel
glyph: ◔
tagline:
  en: Spin a wheel, settle movie night
  da: Drej hjulet og afgør filmaftenen
summary:
  en: Filter, spin a 12-slot wheel and get a title plus where it streams. React on Cloudflare Workers, with the TMDB key kept server-side behind a rate-limited proxy that checks origin and path.
  da: Filtrér, drej et hjul med 12 felter og få en titel plus hvor den streames. React på Cloudflare Workers, hvor TMDB-nøglen bliver på serveren bag en rate-limited proxy, der tjekker origin og path.
areas: [backend]
frontend: true
category: personal
order: 10
featured: true
role: Sole developer
context: Personal project · Movie Explorer spin-off
start: 2026-05
stack: [React 19, TypeScript, Vite, TanStack Query, Cloudflare Workers, Vitest]
repos: [movie-wheel]
demo: https://moviewheel.maintz.dev/
live: https://moviewheel.maintz.dev/
---

## Highlights

- **Server-side TMDB proxy** - a platform-neutral core behind a Cloudflare Worker. It injects the key, 403s foreign origins, allow-lists paths segment by segment, and rate-limits to 60/min per IP
- **Genre combos** - Rom-Com, Horror Comedy, Action Thriller and more, each requiring both genres. TMDB can't express "(A and B) or C", so every selection is queried separately and mixed
- **Better filters** - a minimum vote count (default 100) so a 9.0 with 12 votes stays off the wheel, and original language as a filter. Combos TV can't match are greyed out
- **Result card** with the director (or creator for TV) and a trailer link
- **Tested wheel math** - landing angles are pure functions with a property test, which caught repeat spins landing on the wrong poster. The shuffle is a proper Fisher-Yates. Vitest with an 88% line-coverage floor, CI on every PR
- **Spin as a state machine** - `idle → loading → spinning → stopped`, eased with easeOutCubic, posters preloaded with `crossOrigin` so they can be drawn on the canvas
