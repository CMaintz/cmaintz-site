---
title: jev-java
glyph: ◆
tagline:
  en: A dependency-free Java client for Jev
  da: En afhængighedsfri Java-klient til Jev
summary:
  en: An unofficial Java 21 SDK for TypeSafe AI's Jev, with a sealed question hierarchy over records and truly non-blocking async calls - no runtime dependencies beyond java.net.http.
  da: Et uofficielt Java 21-SDK til TypeSafe AI's Jev med et sealed spørgsmålshierarki over records og reelt ikke-blokerende asynkrone kald - ingen runtime-afhængigheder ud over java.net.http.
areas: [ai]
category: open-source
order: 13
role: Sole developer
context: Open source · v0.1, not on Maven Central yet
start: 2026-09
stack: [Java 21, java.net.http, Virtual threads, Gradle, JUnit, JaCoCo]
repos: [jev-java]
---

## Why

Same idea as [jev-dotnet](/projects/jev-dotnet): typed judgments with calibrated confidence instead of prose, written the way a modern Java codebase would expect.

## Highlights

- A sealed `Question` interface over records (`Choice`, `Score`, `Noul`), so the compiler checks you handled every kind
- `systemOneAsync` uses `HttpClient.sendAsync` and schedules retry backoff without holding a thread
- Interrupt-safe backoff that restores the interrupt flag, and a typed exception hierarchy
- A small internal JSON codec, Gradle dependency locking, and 25 JUnit tests behind an 80% JaCoCo gate
