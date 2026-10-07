---
title: Foundry
glyph: ▣
tagline:
  en: A polyglot engineering gate for AI-assisted development
  da: En sprog-agnostisk kvalitets-gate til AI-assisteret udvikling
summary:
  en: One deterministic quality standard - format, lint, types, tests, coverage, security - enforced identically while an AI agent edits, before push and in CI. Reusable GitHub Actions workflows, mise templates and a Claude Code plugin, released as versioned open source.
  da: Én deterministisk kvalitetsstandard - formatering, lint, typer, tests, coverage, sikkerhed - håndhævet ens, mens en AI-agent redigerer, før push og i CI. Genbrugelige GitHub Actions-workflows, mise-skabeloner og et Claude Code-plugin, udgivet som versioneret open source.
areas: [devops, platform, ai]
category: open-source
order: 2
featured: true
role: Sole designer & developer
context: Open source (MIT) · semver v1.0-v1.2
start: 2026-08
stack: [GitHub Actions, mise, Python, POSIX shell, TypeScript, Semgrep, gitleaks, osv-scanner, ESLint, Spotless, PMD, Claude Code]
repos: [foundry, cmaintz-skills]
metrics:
  - value: "6"
    label: { en: language-agnostic verbs, da: sprog-agnostiske verber }
  - value: "3"
    label: { en: enforcement placements, da: håndhævelsessteder }
  - value: "6"
    label: { en: stacks scaffolded, da: stacks understøttet }
---

## The problem

AI coding agents are fast and tireless - and they thrash. They fix one check and regress another, pass locally and fail in CI, and when a rule gets in the way the cheapest "fix" is to weaken the rule. Teams need one source of truth for quality that behaves identically everywhere and that an agent can't quietly loosen.

## What I built

A unified engineering-quality system in two MIT repos: **`foundry`** (reusable CI workflows + `mise` task templates) and **`cmaintz-skills`** (a Claude Code plugin of skills and hooks). One deterministic rule set sits behind six verbs - `fix` · `lint` · `typecheck` · `test` · `audit` · `gate` - and runs in three placements: in-loop while an agent edits, pre-push, and on the pull request.

## Technical highlights

- **Six-verb interface** - every repo implements the same verbs regardless of language, with toolchains pinned in the same `mise.toml`; tooling calls verbs, never tools
- **Enforcement chosen by cost** - fast formatters fire per edit, expensive JVM formatters and smell sensors once per turn or at the gate, unmechanisable conventions live as standing agent context
- **Deterministic oracle, probabilistic proposer** - linters, types, tests (with coverage floors) and scanners own pass/fail; the LLM only proposes patches, accepted once the gate re-passes from a clean tree
- **Ratcheting instead of gating** - existing issues are baselined and only new violations fail; baselines may only shrink
- **Anti-gaming `ruleset-guard`** - refuses a PR that loosens the gate alongside a source change unless a human labels it deliberate; merge-base-scoped
- **Fresh-context AI review** - the diff is reviewed against the linked spec independently of the session that wrote it
- **Autonomous backlog-to-PR** - the `feature` skill claims a labelled ticket via a GitHub-label state machine, implements in an isolated worktree, runs a bounded `fix → gate` loop and hands off to `ship`
- **Supply-chain hygiene** - SHA-pinned actions, least-privilege tokens, no API keys in CI, secret scanning and diff-aware SAST

## Impact

Dogfooded on a TypeScript/Node pilot and a polyglot Spring Boot + Angular + browser-extension monorepo, and used to gate every tool in the jev-tools family. It removes "green locally, red in CI" drift and lets a legacy codebase adopt strict rules on day one.
