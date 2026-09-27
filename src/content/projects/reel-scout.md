---
title: ReelScout
glyph: ▶
tagline:
  en: One React codebase, running on the web and as an LG webOS TV app
  da: Én React-kodebase, der kører på nettet og som LG webOS-tv-app
summary:
  en: A TMDB-powered movie and TV browser that aggregates ratings, shows where titles stream in your country and - on TV - deep-links straight into the streaming apps. Same React tree for mouse and TV remote.
  da: En film- og tv-browser bygget på TMDB, der samler ratings, viser hvor titler streames i dit land og - på tv - deep-linker direkte ind i streaming-apps. Samme React-træ til mus og fjernbetjening.
category: personal
order: 8
featured: true
role: Sole developer
context: Personal project
start: 2025-07
stack: [React, TypeScript, Vite, TanStack Query, Firebase, LG webOS, Tailwind CSS]
repos: [reel-scout]
demo: https://cmaintz.github.io/reel-scout/
live: https://cmaintz.github.io/reel-scout/
---

## The hard part

The dual target. The same React tree has to work with a mouse *and* a TV remote, on modern browsers *and* older webOS Chromium engines - with no URL rewriting available on the TV.

## Highlights

- **One codebase, two targets** - `HashRouter` and an `es2015` build for webOS
- **TV-first UX** - spatial D-pad navigation, media keys, scroll-on-focus
- **Region resolution** chain (user setting → runtime config → IP geolocation → fallback) driving `/watch/providers`
- **webOS deep links** - TMDB provider IDs mapped to webOS app IDs with Luna launch params
- Ratings from TMDB, IMDb (via OMDb) and Rotten Tomatoes; a Firestore-synced wishlist with optimistic updates; a roulette mode filtered by your own subscriptions
