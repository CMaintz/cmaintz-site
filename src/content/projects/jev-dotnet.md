---
title: jev-dotnet
glyph: ◇
tagline:
  en: A dependency-free .NET client for Jev
  da: En afhængighedsfri .NET-klient til Jev
summary:
  en: An unofficial .NET 8 SDK for TypeSafe AI's Jev - typed Choice, Score and Noul questions in, typed answers with calibrated confidence out - built on nothing but System.Net.Http and System.Text.Json.
  da: Et uofficielt .NET 8-SDK til TypeSafe AI's Jev - typede Choice-, Score- og Noul-spørgsmål ind, typede svar med kalibreret confidence ud - bygget på intet andet end System.Net.Http og System.Text.Json.
areas: [ai]
aiPowered: true
category: open-source
order: 12
role: Sole developer
context: Open source · v0.1, not on NuGet yet
start: 2026-09
stack: [C#, .NET 8, System.Net.Http, System.Text.Json, xUnit]
repos: [jev-dotnet]
---

## Why

A chat LLM hands you a paragraph you have to parse. Jev hands you a value with a shape and a confidence you can threshold on, so you can run it on everything and escalate only the uncertain cases. This makes that pattern feel native in C#.

## Highlights

- Typed `Choice`, `Score` and `Noul` questions, all answered in one request
- Retry with exponential backoff and jitter on 429/529, honouring `Retry-After`
- A typed exception hierarchy under `JevException`, so callers can tell auth, validation and overload apart
- An injectable `HttpMessageHandler` seam for offline tests; 18 xUnit tests behind a 90% line-coverage gate, warnings as errors
- The Java sibling is [jev-java](/projects/jev-java)
