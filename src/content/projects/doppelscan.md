---
title: doppelscan
glyph: ⧉
tagline:
  en: A syntax-aware duplicate code finder that hands an agent the helper to extract
  da: En syntaksbevidst duplikatfinder, der giver agenten den hjælpefunktion, der skal trækkes ud
summary:
  en: Parses code with tree-sitter and finds clones with the same structure even when names and literals differ. Each clone group comes with the parameters, renames and template for the shared helper, as a CLI and as an MCP server any coding agent can call.
  da: Parser koden med tree-sitter og finder kloner med samme struktur, også når navne og literaler er forskellige. Hver klongruppe kommer med parametre, omdøbninger og en skabelon til den fælles hjælpefunktion, som CLI og som MCP-server, som enhver kodeagent kan kalde.
areas: [dx, ai]
category: open-source
order: 17
role: Sole developer
context: Open source (MIT) · v0.1, no release yet
start: 2026-10
stack: [Rust, tree-sitter, rayon, MCP, clap]
repos: [doppelscan]
metrics:
  - value: "0.19 s"
    label: { en: on a 64k-line repo (jscpd 15.8 s), da: på et repo med 64k linjer (jscpd 15,8 s) }
  - value: "12"
    label: { en: languages, da: sprog }
  - value: "4"
    label: { en: MCP tools, da: MCP-værktøjer }
---

## Why

Token-window detectors like jscpd only catch copies that are textually the same, and they report windows that cut across syntax boundaries, which no one can extract as a unit. An agent that copy-pastes a method and renames a few things slips right past them. doppelscan compares syntax trees instead, in the spirit of IntelliJ's duplicate detection, and tells the agent what the helper would look like.

## Highlights

- **Structural hashing** - every syntax node gets a bottom-up hash where identifiers and literals hash by category, so renamed clones match. Shared runs of statements are found with a suffix array and reported once at full length
- **Ready to extract** - occurrences are aligned leaf by leaf: values that differ become helper **parameters**, names the fragment binds itself become **renames**, and the first occurrence with `$1`, `$2` in place is the **template**
- **Noise filtered out** - groups nested in a larger clone, tandem repeats like a wall of getters, and fragments that need too many parameters to be a useful helper are dropped
- **CLI and MCP server** - `find_duplicates`, `get_duplicate_group`, `duplicates_at` and `find_similar_code` ("does this already exist?" before writing a helper). The server keeps parsed files in memory, so follow-up calls take tens of milliseconds
- **Fast** - on a 951-file Java/TypeScript repo it took 0.19 s against jscpd's 15.8 s at the same 50-token minimum, and reported 2.6x more duplicated lines because it also finds renamed clones
- Ships a Claude Code skill for the find-extract-verify loop, and is gated in CI by [Foundry](/projects/foundry)

## Honest limits

It's young: no tagged release yet, so it installs with `cargo install --git`. Near-miss clones with inserted or deleted statements aren't detected, rename vs parameter is a syntactic heuristic rather than name resolution, and matches stay within one language.
