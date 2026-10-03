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
context: jev-tools monorepo · open source · npm package (not published yet)
start: 2026-09
stack: [TypeScript, Node.js, Jev, Vercel AI SDK, LangChain]
repos: [jev-tools]
---

## The idea

Because Jev is effectively free per call, you can afford to guard **every** tool call - and because it reports calibrated confidence, uncertainty can **fail safe**. Each proposed call is scored on policy dimensions you declare (blast radius, destructiveness, exfiltration risk), and a small decision function maps the typed result to `allow`, `block` or `hold`.

## Highlights

- One Jev request per guarded call asks all of the policy's risk questions at once; the policy turns the typed answers into a verdict in plain TypeScript
- Fails safe: low confidence, missing answers and provider errors never resolve to `allow`
- Adapters for LangChain JS (middleware) and the Vercel AI SDK, with structural types so neither framework is a dependency
- Presets like `shellPolicy()`, an audit hook on every verdict, and an `onHold` handler for asking a human
- Shares `@cmaintz/jev-core` (TypeSafe and Cloudflare providers, retries, timeouts, response validation) with jev-sort and jev-triage

It lives in [jev-tools](https://github.com/CMaintz/jev-tools/tree/main/packages/guard), next to the other two tools. Not a security boundary: think second opinion, not sandbox.
