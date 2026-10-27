---
title: classifier-bench
glyph: ⚖
tagline:
  en: Fast typed classifiers against Claude, measured on the same requests
  da: Hurtige typede klassifikatorer mod Claude, målt på de samme forespørgsler
summary:
  en: A zero-dependency Python benchmark that runs TypeSafe Jev, OpenAI Decisions, Cloudflare Clef, Microsoft-Decision-1 and Claude on a frozen, labeled corpus of 2,321 cases, and reports match rate, calibration, p95/p99 latency and cost with bootstrap intervals and McNemar tests.
  da: Et afhængighedsfrit Python-benchmark, der kører TypeSafe Jev, OpenAI Decisions, Cloudflare Clef, Microsoft-Decision-1 og Claude på et fastfrosset, mærket korpus med 2.321 cases og rapporterer match-rate, kalibrering, p95/p99-latens og pris med bootstrap-intervaller og McNemar-tests.
areas: [ai]
aiPowered: true
category: open-source
order: 16
role: Sole developer
context: Open source (MIT) · alpha, run from source, not on PyPI
start: 2026-10
stack: [Python 3.10+, stdlib only, pytest, mypy, ruff]
repos: [classifier-bench]
metrics:
  - value: "2,321"
    label: { en: labeled cases, da: mærkede cases }
  - value: "31"
    label: { en: tasks, da: opgaver }
---

## Why

Purpose-built classification APIs promise LLM-grade judgments at a fraction of the latency and cost. Whether that holds depends on the task, and vendor numbers are measured on the vendor's own terms. classifier-bench puts every classifier on the same requests with the same questions, so the trade-off is measured instead of assumed. It's the wider view next to [jev-eval](/projects/jev-eval), which measures Jev alone on your own data.

## Highlights

- **A frozen corpus** - 434 authored cases across 16 tasks (routing, triage, safety, PII, prompt injection, Danish vs Norwegian vs Swedish and more), where a blind second annotator agreed on 431. Next to them, seeded samples of public sets like BANKING77, CLINC150 and DKHate, scored separately and never pooled
- **One fair protocol** - every classifier gets the same instructions and criteria, no prompt is tuned per classifier, zero retries, one stdlib HTTP stack and wall-clock timing around the single call. Repeats are seeded shuffles with the first classifier rotating per case
- **The full picture** - match rate, macro F1, latency up to p99, reliability (429s, timeouts, fallback answers), cost per correct answer, calibration (ECE, Brier) and self-consistency across repeats
- **Statistics that hold up** - head-to-head differences come with 95% intervals from a clustered bootstrap, plus Cohen's kappa and an exact McNemar test
- **Cascade analysis** - run the cheap classifier on everything, escalate below a confidence cut-point to the LLM, and see escalation rate, match, cost and latency per threshold
- **Cost control** - `estimate` prices a run before it spends anything, and `run` refuses above `--max-cost`. A `--dry-run` uses synthetic providers with no keys
- Every run directory freezes its protocol, cases and prices before the first call and seals them with SHA-256 sums, gated by [Foundry](/projects/foundry)'s Python stack with a 90% coverage floor

## Honest limits

The authored labels were checked by LLM-assisted annotators, not independent experts, and the public test sets are old enough that LLMs have likely seen them. Match rate is agreement with these labels, not general accuracy. I also build tools on top of Jev, which is why the corpus, prompts and scoring rules are all in the repo to check and rerun.
