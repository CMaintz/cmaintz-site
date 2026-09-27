---
title: MovieWheel
glyph: ◔
tagline:
  en: Spin a wheel, settle movie night
  da: Drej hjulet og afgør filmaftenen
summary:
  en: Filter, spin a 12-slot wheel and get a title plus where it streams. A static React frontend with a hardened serverless TMDB proxy - per-IP rate limiting, a path allow-list and edge caching.
  da: Filtrér, drej et hjul med 12 felter og få en titel plus hvor den streames. En statisk React-frontend med en hærdet serverless TMDB-proxy - rate limiting pr. IP, allow-list og edge-caching.
areas: [platform]
category: personal
order: 10
featured: true
role: Sole developer
context: Personal project · ReelScout spin-off
start: 2026-05
end: 2026-06
stack: [React 19, TypeScript, Vite, TanStack Query, Vercel Functions]
repos: [movie-wheel]
---

## Highlights

- **Serverless TMDB proxy** - a catch-all function injects the key server-side, with a per-IP sliding-window limit (60/min), a path allow-list so it can't be used as a general relay, and `s-maxage` + `stale-while-revalidate` caching
- **Spin as a state machine** - `idle → loading → spinning → stopped` with custom easing
- **Canvas-safe posters** - preloaded with `crossOrigin = 'anonymous'` so they can be drawn onto the wheel
- Fully static frontend - free to host
