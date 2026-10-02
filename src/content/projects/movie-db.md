---
title: MovieDB
glyph: ▶
tagline:
  en: One React codebase, running on the web and as an LG webOS TV app
  da: Én React-kodebase, der kører på nettet og som LG webOS-tv-app
summary:
  en: A movie and TV browser that pulls titles from TMDB, adds IMDb and Rotten Tomatoes scores, shows where each title streams in your country and, on the TV, launches straight into the right streaming app. Same React tree for mouse and remote.
  da: En film- og tv-browser, der henter titler fra TMDB, tilføjer IMDb- og Rotten Tomatoes-scores, viser hvor hver titel streames i dit land og på tv'et åbner den rigtige streaming-app direkte. Samme React-træ til mus og fjernbetjening.
category: personal
order: 8
featured: true
role: Sole developer
context: Personal project
start: 2025-04
stack: [React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Firebase, LG webOS, Vitest]
repos: [movie-db-webapp]
demo: https://cmaintz.github.io/movie-db-webapp/
live: https://cmaintz.github.io/movie-db-webapp/
---

## The hard part

The dual target. The same React tree has to work with a mouse *and* a TV remote, on modern browsers *and* older webOS Chromium engines, with no URL rewriting on the TV because webOS loads the app from a file path.

## Highlights

- **One codebase, two targets**: `HashRouter` and an `es2015` build for webOS. On the TV the keys load from a config file, so they can change without a rebuild
- **TV-first UX**: spatial D-pad navigation, media keys, scroll-on-focus and safe-area padding
- **Region resolution** with a clear fallback chain (saved setting → config → IP lookup → `US`) driving the streaming lookups
- **webOS deep links**: streaming providers mapped to TV app IDs, launched with Luna params
- **Firebase** login with wishlist, watched list and settings in Firestore, locked to their owner by rules. OMDb ratings are cached in Firestore for 30 days to stay on the free tier
- **Roulette** that picks a random title filtered by genre, year, minimum score and the services you pay for. [MovieWheel](/projects/movie-wheel) started as a spin-off of it

## Tests and CI

50 Vitest tests on the pure parts (genre mapping, release dates, cast shaping, platform detection, provider deep links), run through my [Foundry](/projects/foundry) gate with lint, types, a coverage floor, audit and secret scanning. Coverage is still low on the components, and the floor only goes up. Every push to `main` deploys the web build to GitHub Pages.

The live web build runs without the OMDb and streaming keys, so those parts need a local setup.

## History

My first version of the app was built with MUI and called ReelScout. I rewrote it with Tailwind and the webOS target in a private repo, then moved that back into this one. The old commits are still in the history.
