---
title: Leash
glyph: ⊸
tagline:
  en: Keeps a coding agent to the project rules no linter can check
  da: Holder en kodeagent til de projektregler, ingen linter kan tjekke
summary:
  en: A Jev-powered guardrail that judges every agent turn against the un-lintable rules in your CLAUDE.md or AGENTS.md, and tells the agent exactly which one it broke so it fixes it before moving on. About 300 ms and a fraction of a cent per turn.
  da: En Jev-baseret guardrail, der vurderer hver agent-tur mod de regler i din CLAUDE.md eller AGENTS.md, som ingen linter kan tjekke, og fortæller agenten præcis hvilken den brød, så den retter det, før den går videre. Cirka 300 ms og en brøkdel af en øre pr. tur.
areas: [ai, devops]
category: open-source
order: 4
featured: true
role: Sole developer
context: Open source · npm CLI and library (not published yet)
start: 2026-09
stack: [TypeScript, Node.js, Jev, Claude Code hooks, Codex hooks, OpenCode, Vitest]
repos: [leash]
---

## Why

Instruction files are full of rules no linter can check: "no premature abstractions", "never let a raw error reach a user", "small single-purpose functions". Nothing enforces them, so an agent breaks them from the first edit. A frontier LLM could judge each rule, but at a cent and a few seconds per check it never pays off. Jev answers one typed yes/no question per rule with a probability in about 300 ms, which is what makes checking every turn viable.

## The ratchet

Judging every file as if freshly written buries you in findings on a real repo. Leash borrows [Foundry](/projects/foundry)'s accepted-debt baseline: existing violations are baselined once, and Leash only flags what a turn **newly** introduces. The baseline can only shrink, so it's adoptable on an existing codebase from day one.

## Highlights

- Runs as Claude Code and Codex hooks: a snapshot at the start of the turn, a check when the agent stops, and on a break it blocks the stop and names the rules to fix. OpenCode gets a plugin that re-prompts once
- The rubric is a committed `.leash/rubric.json`, compiled by your own agent from CLAUDE.md / AGENTS.md. Rules a linter or the gate already enforce are marked `handledBy` and skipped, so Jev is only spent where nothing deterministic can decide
- Blocks at most once per finding per turn, so a finding Jev keeps wrongly reporting can't loop
- `leash calibrate` runs the rules over recent commits and flags ones that never fire; `leash guard` fails CI if the rubric was loosened, with no key and no Jev call
- Fails open everywhere: no key, no rubric or a timeout lets the agent through

## Honest limits

Jev is about 68% accurate, so Leash is advisory. It never blocks a commit or fails a build, and it never runs inside Foundry's gate. It's a coach on the proposer side, never an oracle. It says which rule and how likely, not why; the agent supplies the fix.
