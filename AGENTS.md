## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## One home per concept

Don't hand-copy the same thing into several files. When two places would have to change together, give the concept one home:

- Repeated markup goes in a component in `src/components/` (like `Window.astro`, `ProjectCard.astro`).
- Repeated logic goes in a helper in `src/lib/`.
- A hand-kept list or table (ids, labels, defaults) goes in one object in `src/data/` that everything reads, like `display-effects.ts` or `areas.ts`. An inline script that can't import reads it through `define:vars`.

Only merge copies of the same idea. Two blocks that look alike but change for different reasons stay separate. `lint` fails on duplicated blocks in `.ts`, `.astro` and `.mjs` (habit-hooks' jscpd sensor). Fix the duplication; don't reshuffle code to dodge the detector.

Imports only point downward: `pages -> views -> layouts -> components -> lib -> data -> i18n` (enforced by ESLint).

## Decision notes

Keep decision logs and working notes in the git-ignored `.local/` folder, not in the repo.
