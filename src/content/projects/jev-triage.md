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
context: jev-tools monorepo · GitHub Marketplace
start: 2026-09
stack: [TypeScript, GitHub Actions, Octokit, Jev, Cloudflare Workers AI]
repos: [jev-tools, jev-triage]
---

## Why it exists

Existing LLM triage bots are too slow and too expensive to run on every issue, and they hand back prose you still have to parse. Jev is a *System One* model: text in, **typed probabilistic decisions** out - `choice`, `score`, `noul` - each with a calibrated confidence, in roughly 70-500 ms at near-zero cost.

## What it does

On every opened or edited issue, jev-triage asks a small set of bounded questions (type, priority, area, is-it-security) and applies labels when confidence clears the threshold. Uncertain cases get `triage:needs-human` instead of a guess. It's the "System One in front of System Two" cascade: cheap and fast on everything, honest about what it doesn't know.

## Highlights

- Typed, confidence-gated labels, priority and a team mention. Routing is a plain map in code; Jev never picks the team
- Low-confidence answers get `triage:needs-human`, or are re-asked to any OpenAI-compatible LLM, which leaves a one-line rationale
- Duplicate detection: GitHub search finds candidates, Jev picks one or `none`, and nothing is auto-closed
- Backlog sweep on a schedule, a security flag that alerts rather than labels, and a job summary with the estimated cost of the run
- The code lives in [jev-tools](https://github.com/CMaintz/jev-tools/tree/main/packages/triage); the `jev-triage` repo is a thin wrapper so it can sit on the [Marketplace](https://github.com/marketplace/actions/jev-triage)
- Gated by [Foundry](/projects/foundry), like every tool in the family
