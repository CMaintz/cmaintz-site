---
title: jev-rerank
glyph: ⇅
tagline:
  en: Near-free relevance filtering and reranking for RAG
  da: Næsten gratis relevansfiltrering og reranking til RAG
summary:
  en: A zero-dependency Python library that scores each retrieved passage's relevance to the query with Jev in one batched call, then sorts and filters - at roughly a hundredth of the cost and latency of a hosted reranker.
  da: Et afhængighedsfrit Python-bibliotek, der scorer hver hentet passages relevans for forespørgslen med Jev i ét samlet kald og derefter sorterer og filtrerer - til cirka en hundrededel af prisen og ventetiden for en hostet reranker.
areas: [ai]
aiPowered: true
category: open-source
order: 15
role: Sole developer
context: Open source · v0.1, not on PyPI yet
start: 2026-09
stack: [Python, stdlib urllib, pytest, mypy, ruff]
repos: [jev-rerank]
---

## Why

Rerankers like Cohere Rerank or a cross-encoder are a RAG staple, but they're slow and cost real money per query. Jev's `Score` question type gives each passage a relevance level plus a confidence, and adding questions to a call is near-free, so a whole candidate set can be scored at once.

## Highlights

- One batched Jev call per chunk: every passage becomes a `Score` question over shared `{query, passages}` state
- `min_score` filters, `top_n` truncates, and `batch_size` keeps each call under Jev's context cap
- A few lines turn it into a LlamaIndex postprocessor or a LangChain reranker; first-class adapters are on the roadmap
- Passes the [Foundry](/projects/foundry) gate (ruff, mypy, pytest, pip-audit)

## Honest limits

It's a cheap first pass, not a cross-encoder. For the last few points of ranking quality a dedicated cross-encoder still wins, so jev-rerank shines as a prefilter in front of one, or where hosted-reranker cost and latency are the actual problem. The TypeScript tools built on the same idea are [jev-tools](/projects/jev-tools).
