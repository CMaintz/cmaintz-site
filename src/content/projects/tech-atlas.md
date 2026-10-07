---
title: Tech Atlas
glyph: ✱
tagline:
  en: A bilingual technical dictionary you can explore as a map
  da: En tosproget teknisk ordbog, du kan udforske som et kort
summary:
  en: About 420 security, CS, AI and platform terms in English and Danish, linked by typed, sourced relationships into a knowledge graph with a 2D/3D explorer, plain-language explanations and quizzes.
  da: Omkring 420 begreber inden for sikkerhed, datalogi, AI og platform på engelsk og dansk, forbundet af typede relationer med kilder til en vidensgraf med 2D/3D-explorer, letforståelige forklaringer og quizzer.
areas: [ai]
category: personal
order: 7
featured: true
role: Sole developer
context: Personal project · open source
start: 2026-09
stack: [Astro, TypeScript, Supabase, Cytoscape, Three.js, PL/pgSQL]
repos: [tech-atlas]
video: /media/tech-atlas-explorer
live: https://atlas.maintz.dev/en/explorer/
---

## What it is

Tech Atlas explains technical terms across security, computer science, AI and platform engineering in English and Danish side by side. Every term is linked to others by **typed, sourced relationships** - "is a kind of", "requires", "contrasts with" - so the dictionary doubles as a navigable knowledge graph.

It's anchored to a real Danish cybersecurity (GRC) course and written first for Danish learners who need both the English and the Danish terms, explained in plain language.

## Highlights

- Four facets per term: formal definition, plain-language explanation, example in practice, why it matters
- Summaries use a **closed vocabulary** (plain words plus other defined terms), enforced by a lint
- Whole-graph explorer in **2D and 3D** (the clip above: force layout, layout by depth, then 3D) - try it live via the button at the top
- Quizzes and semantic search
