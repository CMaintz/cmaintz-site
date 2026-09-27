---
title: DevInsight
glyph: ◫
tagline:
  en: GitHub activity turned into an evidence-based portfolio
  da: GitHub-aktivitet omsat til en evidensbaseret portfolio
summary:
  en: A Spring Boot platform (strict hexagonal) that imports a developer's GitHub repositories and is designed to score them on activity, structure and code quality. Plumbing done; scoring engine in progress.
  da: En Spring Boot-platform (strengt hexagonal), der importerer en udviklers GitHub-repos og er designet til at score dem på aktivitet, struktur og kodekvalitet. Fundamentet er på plads; scoringsmotoren er under udvikling.
areas: [dx]
category: personal
order: 11
role: Sole developer
context: Personal project · in development
start: 2026-03
end: 2026-05
stack: [Java, Spring Boot, Spring Security, OAuth2, JWT, JPA, PostgreSQL, Flyway]
repos: [dev-insight]
---

## Status, honestly

The plumbing is in place - seven inbound use-case ports, five outbound ports, GitHub OAuth2 login issuing JWTs, repository import, JPA persistence and REST controllers. The **scoring engine is designed but still being implemented**: the activity, structure and quality metrics are scaffolded with their intended inputs (commit frequency, PR cadence, README/CI/test presence, complexity, coverage) and currently stubbed.

## Highlights

- `domain/{model,port.in,port.out,service}` core with REST and GitHub/persistence adapters; dependencies point inward
- GitHub OAuth2 → JWT via Spring Security
- Repository import via `kohsuke/github-api`, deduplicated through a persistence port
