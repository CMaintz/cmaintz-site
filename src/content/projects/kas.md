---
title: KAS - Conference Administration
glyph: ▥
tagline:
  en: A JavaFX desktop app with real business rules
  da: En JavaFX-desktopapp med rigtige forretningsregler
summary:
  en: Conference administration - participants, hotels with room types and add-ons, excursions and bookings - with a pricing engine distributed across a rich domain model.
  da: Konferenceadministration - deltagere, hoteller med værelsestyper og tilkøb, udflugter og bookinger - med en prismotor fordelt på en rig domænemodel.
category: academic
order: 22
role: Developer
context: Datamatiker, 2nd-semester exam (Java)
start: 2024-05
dateApprox: true
grade: 10/12
stack: [Java, JavaFX, OOP, MVC]
repos: [conference-admin-sys]
---

## Highlights

- Business rules live in the model: lecturers attend free, a companion forces a double room, booked add-ons can't be deleted, date pickers constrained to the conference window
- Pricing distributed via Information Expert - bookings sum their parts and delegate accommodation to the hotel
- JavaFX GUI with tabbed panes and modal dialogs over a static controller facade
