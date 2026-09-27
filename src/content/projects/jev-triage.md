---
title: jev-triage
glyph: ⚑
tagline:
  en: Near-free GitHub issue triage with confidence-gated escalation
  da: Næsten gratis triage af GitHub-issues med confidence-baseret eskalering
summary:
  en: A GitHub Action that labels every new issue with TypeSafe AI's Jev in milliseconds for fractions of a cent - and escalates only the ones it's unsure about to a human or a real LLM.
  da: En GitHub Action, der labeler hvert nyt issue med TypeSafe AI's Jev på millisekunder for brøkdele af en øre - og kun eskalerer dem, den er usikker på, til et menneske eller en rigtig LLM.
areas: [ai, devops]
category: open-source
order: 3
featured: true
role: Sole developer
context: jev-tools · open source
start: 2026-09
stack: [TypeScript, GitHub Actions, Octokit, Jev, Cloudflare Workers AI]
repos: [jev-triage]
---

## Why it exists

Existing LLM triage bots are too slow and too expensive to run on every issue, and they hand back prose you still have to parse. Jev is a *System One* model: text in, **typed probabilistic decisions** out - `choice`, `score`, `noul` - each with a calibrated confidence, in roughly 70-500 ms at near-zero cost.

## What it does

On every opened or edited issue, jev-triage asks a small set of bounded questions (type, priority, area, is-it-security) and applies labels when confidence clears the threshold. Uncertain cases get `triage:needs-human` instead of a guess. It's the "System One in front of System Two" cascade: cheap and fast on everything, honest about what it doesn't know.

## Highlights

- Typed, confidence-gated labels - never a silent wrong guess
- A security-flag path that alerts rather than labels
- Backlog mode to triage existing issues in bulk
- Gated by [Foundry](/projects/foundry), like every tool in the family
