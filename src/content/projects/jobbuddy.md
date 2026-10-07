---
title: Jobbuddy
glyph: ◧
tagline:
  en: AI job-application platform - from posting to tailored CV
  da: AI-platform til jobansøgninger - fra jobopslag til skræddersyet CV
summary:
  en: A Spring Boot (strict hexagonal) + Angular platform that ingests job postings and generates tailored CVs and cover letters with ATS match reports, backed by Postgres full-text and pgvector semantic search.
  da: En Spring Boot- (strengt hexagonal) og Angular-platform, der henter jobopslag og genererer skræddersyede CV'er og ansøgninger med ATS-matchrapporter, med Postgres fuldtekst- og pgvector-søgning.
areas: [ai]
category: personal
order: 6
featured: true
role: Sole developer
context: Personal project
start: 2026-05
stack: [Java, Spring Boot, Angular, PostgreSQL, pgvector, Flyway, LLM APIs, Firebase Auth, Docker]
repos: [jobbuddy]
---

## What it is

A job-application platform that fetches postings through web crawling and RSS/API connectors, keeps a structured career profile, and uses an LLM to generate CVs and cover letters tailored to a specific posting - with ATS match reports and PDF export.

## Architecture

The backend is **strict hexagonal (ports & adapters)**: controllers depend only on inbound ports, use cases only on outbound ports, so the AI provider, search engine and persistence are swappable adapters. All AI output is structured JSON assembled server-side into a `StructuredDocument` model that both the UI and the PDF renderer consume - no raw text blobs.

## Highlights

- **Privacy by design** - the `CareerProfileForAi` payload excludes all PII; identity is merged into documents after the AI call
- **All-Postgres search** - `tsvector` full-text for keywords, **pgvector** for semantic search (embedding-based query vectors)
- **Pluggable LLMs** - the model provider is an adapter behind a port, swappable without touching use cases
- Angular standalone components with lazy routes, Firebase JWT auth, Flyway migrations, OpenAPI docs, Docker Compose
