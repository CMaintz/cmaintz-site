---
title: Plantekalender
glyph: ✿
tagline:
  en: A garden calendar that knows your plants and your local frost
  da: En havekalender, der kender dine planter og din lokale frost
summary:
  en: An unreleased work in progress. Register your garden, beds and plants, and get sowing, pruning and harvest tasks tuned to your local climate, plus frost alerts and crop-rotation warnings. One product across a web app on Cloudflare Workers and native iOS and Android apps.
  da: Endnu ikke udgivet og stadig under udvikling. Registrér din have, dine bede og planter, og få opgaver til såning, beskæring og høst tilpasset dit lokale klima, plus frostvarsler og advarsler om sædskifte. Ét produkt på tværs af en webapp på Cloudflare Workers og native iOS- og Android-apps.
areas: [backend]
frontend: true
category: personal
order: 18
role: Sole developer
context: Personal project · unreleased work in progress
start: 2026-10
stack: [TypeScript, Hono, Cloudflare Workers, D1, React 19, Vite, SwiftUI, Kotlin, Jetpack Compose, Vitest]
repos: [plantekalender-ios]
live: https://plantekalender.cmaintz-site.workers.dev
---

**Work in progress:** not released yet. The deployed app runs, but it's still being built and isn't open to real users.

## Highlights

- **Tasks, not fixed dates** - sowing, planting, pruning, feeding, harvesting and winterising are generated from your plants and your garden's own climate profile, built from ten years of daily minimum temperatures for its location
- **Frost alerts** - a 7-day forecast is checked against the plants that are actually out, and an alert names only the frost-sensitive ones. If the forecast is missing, the API says so instead of showing "no frost"
- **Bed planning** - crop-rotation warnings, companion plants, boxes drawn inside a bed with a 10 cm grid, and variety types that shift a plant's care calendar. Greenhouse beds move the frost dates
- **Harvest log** with yearly totals per plant and bed, notification digests and frost mails, a calendar feed, and an export of all your data as one JSON file
- **One API, three clients** - a Hono API and React SPA on one Cloudflare Worker with D1. The SwiftUI and Kotlin/Jetpack Compose apps talk to the same JSON API
- **Testable rule engine** - the domain logic is pure and layered apart from I/O, and the SQL runs against `node:sqlite` in tests, so the same queries are tested that run in production. Gated by [Foundry](/projects/foundry)

Only the iOS app's repo is public.
