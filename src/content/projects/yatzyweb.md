---
title: Yatzyweb
glyph: ⚅
tagline:
  en: Multiplayer Yahtzee with server-authoritative scoring
  da: Multiplayer-Yatzy med serverautoritativ pointberegning
summary:
  en: Browser Yahtzee on Node.js/Express with a framework-free client, server-side scoring that can't be tampered with, and crash-safe persistence after every action.
  da: Yatzy i browseren på Node.js/Express med en framework-fri klient, pointberegning på serveren og crash-sikker persistens efter hver handling.
areas: [backend]
category: academic
order: 25
role: Developer
context: Datamatiker coursework (Distributed Programming)
start: 2025-03
dateApprox: true
stack: [JavaScript, Node.js, Express, Pug]
repos: [yatzyweb]
---

## Highlights

- Scoring computed server-side from a six-slot counts array - the client never computes points
- Small REST API with `express-session` identity
- Full game state written to disk after every action; restart mid-game without losing progress
