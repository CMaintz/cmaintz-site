---
title: jev-sort
glyph: ≡
tagline:
  en: jq for judgment - bulk classification at pennies per 10k rows
  da: jq for vurderinger - masseklassificering for småpenge pr. 10.000 rækker
summary:
  en: A CLI that streams JSONL/CSV rows through Jev and returns typed classification and score columns plus a confidence field, flagging low-confidence rows for review.
  da: Et CLI-værktøj, der streamer JSONL/CSV-rækker gennem Jev og returnerer typede klassifikations- og score-kolonner med confidence, og markerer usikre rækker til gennemsyn.
category: open-source
order: 5
role: Sole developer
context: jev-tools · open-source CLI
start: 2026-09
stack: [TypeScript, Node.js, Jev, JSONL, CSV]
repos: [jev-sort]
---

## When to use it (honestly)

jev-sort earns its place at scale - 10k to 1M rows - where running an LLM per row *is* the problem. At roughly $0.00001 and ~100 ms per row, "classify 10k rows for pennies" becomes true. Below a few thousand rows a one-off LLM script is simpler, and if the rule is crisp, plain code wins. jev-sort is for judgments too fuzzy to regex but bounded enough not to need prose.

## Highlights

- Inline questions: `-q 'team:choice(billing,tech,sales)'`, `-q 'urgent:noul'`, `-q 'size:score(low,mid,high)'`
- `--escalate 'conf<0.6'` writes uncertain rows to a review file
- Streams stdin to stdout, so it composes with `jq`, `csvkit` and friends
