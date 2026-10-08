---
title: Birdie
glyph: ⌖
tagline:
  en: Log bird sightings where you stand; see everyone's on a map
  da: Registrér fugle, hvor du står; se alles observationer på et kort
summary:
  en: A SwiftUI birdwatching app - log a species with notes and GPS in one tap, browse sightings as a list or on an interactive MapKit map. Firebase backend, MVVM with @Observable.
  da: En SwiftUI-app til fuglekiggere - registrér en art med noter og GPS med ét tryk, og se observationer som liste eller på et interaktivt MapKit-kort. Firebase-backend, MVVM med @Observable.
areas: [backend]
frontend: true
category: academic
order: 21
role: Sole developer
context: Datamatiker, iOS exam (Swift)
start: 2025-05
dateApprox: true
grade: 10/12
stack: [Swift, SwiftUI, Swift Concurrency, Firebase, MapKit, Core Location]
repos: [birdie-ios]
---

## Highlights

- MVVM with iOS 17 `@Observable` view-models and a `Contracts/` layer of protocols around Firebase and Core Location
- `async`/`await` throughout; Firebase Auth, Firestore and Storage
- Filter by species, distance or your own entries; reverse-geocoded place names
- A custom SwiftUI splash animation (a flock of birds and a rising sun)
