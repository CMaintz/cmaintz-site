---
title: TimeRegistry
glyph: ◷
tagline:
  en: One business core, two frontends - WPF and ASP.NET MVC
  da: Én forretningskerne, to frontends - WPF og ASP.NET MVC
summary:
  en: Employee time registration with real validation rules - overlap detection and a 37-hour weekly cap - behind interface contracts so a WPF desktop client and an ASP.NET MVC web app share one core.
  da: Tidsregistrering med rigtige valideringsregler - overlap-detektion og loft på 37 timer om ugen - bag interface-kontrakter, så en WPF-klient og en ASP.NET MVC-webapp deler én kerne.
areas: [backend]
category: academic
order: 23
role: Developer in a group
context: Datamatiker, 4th-semester group exam (C#)
start: 2025-05
dateApprox: true
grade: 7/12
stack: [C#, .NET, WPF, MVVM, ASP.NET MVC, Entity Framework, Autofac]
repos: []
---

## Highlights

- Validation: start-before-end, overlap detection and a 37-hour weekly cap, with culture-based week-of-year bucketing
- Shared BLL/DAL behind a `Contracts` project; Autofac wiring
- EF6 with a generic `Repository<T>` and entity ↔ DTO mappers
