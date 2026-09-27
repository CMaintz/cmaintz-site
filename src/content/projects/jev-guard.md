---
title: jev-guard
glyph: ⛨
tagline:
  en: A fail-safe guardrail for LLM agents' tool calls
  da: En fejlsikker guardrail for LLM-agenters værktøjskald
summary:
  en: A TypeScript library that vets every tool call an agent proposes through Jev before it runs - allow, block or hold for a human - so an autonomous agent can't rm -rf your box on a bad hunch.
  da: Et TypeScript-bibliotek, der vurderer hvert værktøjskald, en agent foreslår, gennem Jev, før det køres - tillad, bloker eller hold til et menneske - så en autonom agent ikke kører rm -rf på et dårligt indfald.
areas: [ai, platform]
category: open-source
order: 4
featured: true
role: Sole developer
context: jev-tools · open source · npm package
start: 2026-09
stack: [TypeScript, Node.js, Jev, Vercel AI SDK, LangChain]
repos: [jev-guard]
---

## The idea

Because Jev is effectively free per call, you can afford to guard **every** tool call - and because it reports calibrated confidence, uncertainty can **fail safe**. Each proposed call is scored on policy dimensions you declare (blast radius, destructiveness, exfiltration risk), and a small decision function maps the typed result to `allow`, `block` or `hold`.

## Highlights

- Declarative policy: `score([...])` and `noul(...)` dimensions plus a plain `decide` function
- Provider port - TypeSafe's first-party API or Cloudflare Workers AI
- Built for common agent frameworks (Vercel AI SDK, LangChain)
- Uncertain → hold for a human; never silently allow
