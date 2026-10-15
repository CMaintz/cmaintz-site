---
title: Multiplayer Maze
glyph: ▦
tagline:
  en: Real-time multiplayer over raw TCP sockets
  da: Realtids-multiplayer over rå TCP-sockets
summary:
  en: A Pac-Man-inspired maze game with a hand-designed text protocol, one server thread per client and a synchronized broadcast relay - played by several people at once on a real LAN.
  da: Et Pac-Man-inspireret labyrintspil med en hjemmelavet tekstprotokol, én servertråd pr. klient og synkroniseret broadcast - spillet af flere samtidig på et rigtigt LAN.
areas: [backend]
category: academic
order: 26
role: Developer
context: Datamatiker coursework (Distributed Information Systems)
start: 2024-10
dateApprox: true
stack: [Java, JavaFX, TCP sockets, Multithreading]
repos: [multiplayer-maze]
---

## Highlights

- `ServerSocket` with one `ServerThread` per client and a `synchronized broadcast()`
- Custom `CONNECT` / `REGISTER` / `MOVE` text protocol, designed from scratch
- JavaFX client with directional sprites and a live scoreboard
