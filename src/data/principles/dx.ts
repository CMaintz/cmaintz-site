import type { Principle } from './principle';

export const dx: Principle[] = [
  {
    title: { en: 'Feedback in seconds, not in CI', da: 'Feedback på sekunder, ikke i CI' },
    body: {
      en: 'The same checks run in the editor, before push and in CI, so problems surface while the code is still in your head, not twenty minutes later.',
      da: 'De samme tjek kører i editoren, før push og i CI, så problemer dukker op, mens koden stadig er frisk, og ikke tyve minutter senere.',
    },
    proof: ['foundry'],
  },
  {
    title: { en: 'One command to a working setup', da: 'Én kommando til et fungerende setup' },
    body: {
      en: 'Pinned toolchains and reproducible environments end "works on my machine". A new developer should be productive on day one.',
      da: 'Fastlåste toolchains og reproducerbare miljøer gør en ende på "det virker på min maskine". En ny udvikler skal være produktiv fra dag ét.',
    },
    proof: ['foundry'],
  },
  {
    title: { en: 'Remove steps instead of documenting them', da: 'Fjern trin i stedet for at dokumentere dem' },
    body: {
      en: 'Scaffolding, CLI tools and previews beat a wiki page listing twelve manual steps nobody reads.',
      da: 'Scaffolding, CLI-værktøjer og previews slår en wiki-side med tolv manuelle trin, som ingen læser.',
    },
    proof: ['email-template-preview'],
  },
  {
    title: { en: 'Ask where the time goes first', da: 'Spørg først, hvor tiden går hen' },
    body: {
      en: 'Before picking tools I watch how the team actually works. The biggest win is often not the one anyone asked for.',
      da: 'Før jeg vælger værktøjer, ser jeg på, hvordan teamet reelt arbejder. Den største gevinst er ofte ikke den, nogen bad om.',
    },
  },
  {
    title: { en: 'Coding agents are developers too', da: 'Kodeagenter er også udviklere' },
    body: {
      en: 'Agents get the same onboarding a person would: AGENTS.md conventions, skills for recurring jobs and hooks that catch mistakes the moment they happen.',
      da: 'Agenter får den samme onboarding som et menneske: AGENTS.md-konventioner, skills til tilbagevendende opgaver og hooks, der fanger fejl i samme øjeblik, de sker.',
    },
    proof: ['leash', 'foundry'],
  },
  {
    title: { en: 'Conventions live in the tooling', da: 'Konventioner bor i værktøjerne' },
    body: {
      en: 'If a rule matters, a check enforces it: architecture tests, import boundaries, duplication limits. Review time goes to design, not to repeating the style guide.',
      da: 'Hvis en regel betyder noget, håndhæver et tjek den: arkitekturtests, importgrænser og grænser for duplikering. Reviewtiden går til design, ikke til at gentage stilguiden.',
    },
    proof: ['dev-insight', 'foundry'],
  },
  {
    title: { en: 'Errors that tell you the fix', da: 'Fejl, der fortæller dig løsningen' },
    body: {
      en: 'A failing check names exactly which rule broke and where, so a person or an agent can fix it without going digging.',
      da: 'Et fejlende tjek nævner præcis, hvilken regel der blev brudt og hvor, så et menneske eller en agent kan rette det uden at skulle lede efter det.',
    },
    proof: ['leash'],
  },
  {
    title: { en: 'A flaky check is a broken check', da: 'Et ustabilt tjek er et ødelagt tjek' },
    body: {
      en: 'A test that fails at random teaches everyone to ignore red. It gets fixed or removed, never retried until green.',
      da: 'En test, der fejler tilfældigt, lærer alle at ignorere rødt. Den bliver rettet eller fjernet, aldrig kørt igen, til den bliver grøn.',
    },
  },
];
