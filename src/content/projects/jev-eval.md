---
title: jev-eval
glyph: ⊿
tagline:
  en: Measure Jev on your own labeled data and get the confidence cut-point to gate on
  da: Mål Jev på dine egne mærkede data og få den confidence-grænse, du skal gate på
summary:
  en: A zero-dependency Python CLI and library that reports Jev's accuracy and calibration on your own labeled data, then recommends the confidence threshold for "auto-decide the confident cases, escalate the rest" - with an out-of-bag bootstrap so the number isn't flattering itself.
  da: Et afhængighedsfrit Python-CLI og -bibliotek, der måler Jevs nøjagtighed og kalibrering på dine egne mærkede data og derefter anbefaler confidence-grænsen for "afgør de sikre tilfælde automatisk, eskaler resten" - med out-of-bag bootstrap, så tallet ikke smigrer sig selv.
areas: [ai]
category: open-source
order: 14
role: Sole developer
context: Open source · v1.0, not on PyPI yet
start: 2026-10
stack: [Python 3.10+, stdlib only, pytest, mypy, ruff]
repos: [jev-eval]
---

## Why

Every confidence-gated workflow in the family needs a cut-point: jev-sort's `--escalate`, Leash's repair band, a jev-guard hold threshold. Jev is about 68% accurate raw, so that number decides whether gating works at all. Too low and you auto-accept wrong answers; too high and everything escalates, which throws away the cost win that justified Jev. jev-eval replaces the guess with a measurement.

## Highlights

- Risk-coverage is the headline: for each candidate gate, how many rows get auto-decided and how accurate those rows are. Calibration (ECE and a reliability table) is the trust check
- An honesty guard by default: picking a cut-point on the same rows you score it on flatters the result, so it bootstraps 1000 resamples and reports the out-of-bag accuracy next to the optimistic one
- Below 200 labeled rows a recommendation is marked provisional; below 50 it's refused
- Only `run` calls Jev. Reports, thresholds and `compare` (model-pin drift, or A/B two question wordings) are pure functions over a resumable local cache, so re-slicing is free
- Writes a small versioned `thresholds.json` the [jev-tools](/projects/jev-tools) and [Leash](/projects/leash) can load
- 99% test coverage against a fake provider, gated by [Foundry](/projects/foundry)'s Python stack

It measures Jev; it doesn't improve it. And it recommends a threshold for a human to review, never changing a production threshold itself.
