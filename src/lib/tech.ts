// The "built with" filters on /projects: languages read from each project's
// stack, plus whether it has AI features built in (the `aiPowered` flag).

export const LANGUAGES = ['TypeScript', 'JavaScript', 'Java', 'C#', 'PHP', 'Python', 'Swift', 'Kotlin'] as const;

/** A filter id that is safe in a URL hash: "C#" -> "csharp". */
export const techId = (name: string) => name.toLowerCase().replace('#', 'sharp');

/** Languages named in a stack. "Java 21" and "PHP 8.1+" count; "JavaScript" isn't Java. */
export function stackLanguages(stack: string[]) {
  return LANGUAGES.filter((lang) => stack.some((s) => s === lang || s.startsWith(`${lang} `)));
}

/** Filter ids for one project, as written to its card's data-tech attribute. */
export function techIds(stack: string[], aiPowered: boolean) {
  const ids = stackLanguages(stack).map(techId);
  return aiPowered ? ['ai-powered', ...ids] : ids;
}
