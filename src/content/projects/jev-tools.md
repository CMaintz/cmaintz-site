---
title: jev-tools
glyph: ⚑
tagline:
  en: Three TypeScript tools that put a cheap, typed model in front of the expensive one
  da: Tre TypeScript-værktøjer, der sætter en billig, typet model foran den dyre
summary:
  en: A monorepo of tools built on TypeSafe AI's Jev - an agent tool-call guardrail, a GitHub issue-triage Action and a bulk classification CLI - that run Jev on everything and hand only the uncertain cases to a human or a real LLM.
  da: Et monorepo med værktøjer bygget på TypeSafe AI's Jev - en guardrail for agenters værktøjskald, en GitHub Action til issue-triage og et CLI til masseklassificering - der kører Jev på alt og kun sender de usikre tilfælde videre til et menneske eller en rigtig LLM.
areas: [ai, platform, devops]
aiPowered: true
category: open-source
order: 3
featured: true
role: Sole developer
context: Open source · npm workspaces monorepo · GitHub Marketplace
start: 2026-09
stack: [TypeScript, Node.js, Jev, GitHub Actions, Octokit, Vercel AI SDK, LangChain, Cloudflare Workers AI]
repos: [jev-tools, jev-triage]
---

## Why Jev

Existing LLM bots are too slow and too expensive to run on every issue, row or tool call, and they hand back prose you still have to parse. Jev is a _System One_ model: text in, **typed probabilistic decisions** out - `choice`, `score`, `noul` - each with a calibrated confidence, in roughly 70-500 ms at near-zero cost.

All three tools use it the same way: ask narrow questions, branch on the typed answer in code, and send anything Jev is unsure about to a human or a larger model. They share `@cmaintz/jev-core` (TypeSafe and Cloudflare providers, retries, timeouts, response validation), which replaced three identical copies of the provider code when the tools were merged into one repo with their history.

## jev-guard

A fail-safe guardrail for an agent's tool calls. Because Jev is effectively free per call, you can afford to guard **every** call, and because it reports confidence, uncertainty can **fail safe**. Each proposed call is scored on policy dimensions you declare (blast radius, destructiveness, exfiltration risk), and a small decision function maps the typed result to `allow`, `block` or `hold`.

- One Jev request per guarded call asks all of the policy's risk questions at once
- Low confidence, missing answers and provider errors never resolve to `allow`
- Adapters for LangChain JS (middleware) and the Vercel AI SDK, with structural types so neither framework is a dependency
- Presets like `shellPolicy()`, an audit hook on every verdict, and an `onHold` handler for asking a human
- Not a security boundary: think second opinion, not sandbox

## jev-triage

A GitHub Action that labels every new issue in milliseconds for fractions of a cent, and escalates only the ones it's unsure about. It asks a small set of bounded questions (type, priority, area, is-it-security) and applies labels when confidence clears the threshold.

- Typed, confidence-gated labels, priority and a team mention. Routing is a plain map in code; Jev never picks the team
- Low-confidence answers get `triage:needs-human`, or are re-asked to any OpenAI-compatible LLM, which leaves a one-line rationale
- Duplicate detection: GitHub search finds candidates, Jev picks one or `none`, and nothing is auto-closed
- Backlog sweep on a schedule, a security flag that alerts rather than labels, and a job summary with the estimated cost of the run
- The `jev-triage` repo is a thin wrapper so it can sit on the [Marketplace](https://github.com/marketplace/actions/jev-triage)

## jev-sort

jq for judgment: a CLI that streams JSONL/CSV rows through Jev and appends typed columns plus a confidence field. It earns its place at scale - 10k to 1M rows - where running an LLM per row _is_ the problem. Below a few thousand rows a one-off LLM script is simpler, and if the rule is crisp, plain code wins.

- Inline questions: `-q 'team:choice(billing,tech,sales)'`, `-q 'urgent:noul'`, `-q 'size:score(low,mid,high)'`
- `--escalate 'conf<0.6'` writes uncertain rows to a review file, and `--reject-out` collects rows Jev couldn't answer, so nothing disappears silently
- Streams stdin to stdout, so it composes with `jq`, `csvkit` and friends. Also usable as a library

## Related

[jev-eval](/projects/jev-eval) measures where each tool's confidence cut-point should sit, [jev-rerank](/projects/jev-rerank) applies the same idea to RAG in Python, and [Leash](/projects/leash) uses Jev to keep a coding agent to your project's rules. Every package is gated by [Foundry](/projects/foundry).
