---
title: DevInsight
glyph: ◫
tagline:
  en: GitHub activity turned into an evidence-based portfolio
  da: GitHub-aktivitet omsat til en evidensbaseret portfolio
summary:
  en: Imports your GitHub repositories, measures activity, commit habits, structure and quality, and turns that into scores you can trace back to the numbers. .NET 10 and Angular 22, hexagonal, on PostgreSQL.
  da: Importerer dine GitHub-repos, måler aktivitet, commit-vaner, struktur og kvalitet og gør det til scores, du kan føre tilbage til tallene. .NET 10 og Angular 22, hexagonal, på PostgreSQL.
areas: [dx]
category: personal
order: 11
role: Sole developer
context: Personal project · runs locally, not deployed yet
start: 2026-03
stack: [C#, .NET 10, ASP.NET Core, EF Core, PostgreSQL, Angular 22, TypeScript, xUnit, Testcontainers, Vitest, Docker, Bicep]
repos: [dev-insight]
---

## Why

Most developer portfolios are a list of projects and a few adjectives. I wanted one that shows *how* someone develops, from data that's hard to fake.

## What it does

- **Private dashboard**: scores, activity and score history over time, language mix, commit sizes and the most important feedback across your repositories
- **Explainable scores**: every score is a weighted sum of stored metrics (activity 30%, structure 30%, quality 40%), and the UI shows each metric's value, points and weight. Scored on the whole repository or only your own commits
- **Feedback**: rule-based findings (vague commit messages, monolith files, missing tests), including what you do well, plus optional AI feedback that sticks to the measured data
- **Public portfolio** at `/u/<login>`, private until you publish it, scored on your own commits

## How it's built

- **Hexagonal**: domain and use cases have no framework dependencies, and an architecture test fails the build if the domain or application layer ever references EF Core, ASP.NET Core, Octokit or the AI SDK
- **Background analysis**: a worker clones the repository with `git` (one clone instead of thousands of rate-limited API calls), runs the pure analysis engine and stores an append-only analysis. A daily job re-analyses selected repositories, so the score history grows by itself
- **Integration tests** boot the real app against a disposable PostgreSQL and walk the whole journey from GitHub sign-in to the public portfolio, plus security cases like forged OAuth state, open redirects and cross-user access
- **Coverage floors** in CI: 85% lines on the backend, 90% on the frontend

## Status

All six use cases from the spec are implemented. It isn't deployed yet: the GitHub Pages + Azure Container Apps pipeline (Bicep, OIDC) is in place, but for now it runs locally. It started as a Java/Spring Boot skeleton, and I rebuilt it on .NET.
