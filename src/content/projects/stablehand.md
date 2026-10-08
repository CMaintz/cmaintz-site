---
title: StableHand
glyph: ♞
tagline:
  en: Booking and management for a real riding school
  da: Booking og administration for en rigtig rideskole
summary:
  en: A multi-actor booking system for Hørning Rideskole - horses, riders, time slots, a mucking-out reward rota and payments - with a hand-written ADO.NET data layer instead of an ORM.
  da: Et bookingsystem for Hørning Rideskole - heste, ryttere, tider, en mugningsordning med belønning og betaling - med et håndskrevet ADO.NET-datalag i stedet for en ORM.
areas: [backend]
category: academic
order: 24
role: Developer in a group
context: Datamatiker, 4th-semester group exam (Systems Development Methods)
start: 2025-05
dateApprox: true
grade: 10/12
stack: [C#, ASP.NET MVC, ADO.NET, Azure SQL, BCrypt]
repos: []
---

## Highlights

- One hand-written DAO per aggregate over a shared connector - explicit SQL and mapping, by design
- BCrypt authentication with role-aware access; SMTP notifications for cancellations
- Domain logic: a free lesson after X mucking-out shifts, horse sick-leave affecting availability
- Automated acceptance-test suite
