// The "built with" filters on /projects: languages read from each project's
// stack, plus the frontend and aiPowered flags from its frontmatter.

export const LANGUAGES = ['TypeScript', 'JavaScript', 'Java', 'C#', 'PHP', 'Python', 'Swift', 'Kotlin'] as const;

/** A filter id that is safe in a URL hash: "C#" -> "csharp". */
export const techId = (name: string) => name.toLowerCase().replace('#', 'sharp');

/** Languages named in a stack. "Java 21" and "PHP 8.1+" count; "JavaScript" isn't Java. */
export function stackLanguages(stack: string[]) {
  return LANGUAGES.filter((lang) => stack.some((s) => s === lang || s.startsWith(`${lang} `)));
}

/** Filter ids for one project, as written to its card's data-tech attribute. */
export function techIds(p: { stack: string[]; aiPowered: boolean; frontend: boolean }) {
  const flags = [p.frontend && 'frontend', p.aiPowered && 'ai-powered'].filter((f): f is string => !!f);
  return [...flags, ...stackLanguages(p.stack).map(techId)];
}
