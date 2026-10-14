// The blog's tag vocabulary: the Keystatic picker, the content schema and the
// dev.to cross-post all read this list. `id` is the site's tag (/blog/tags/<id>);
// `devto` is the tag it becomes on dev.to, which allows four lowercase alphanumeric
// tags per post. Readers there follow established tags, so a site tag without a
// well-followed equivalent maps to none. The order is dev.to priority: a post sends
// the first four distinct dev.to tags its own tags map to, in this order.
export const TAGS = [
  { id: 'ai', devto: 'ai' },
  { id: 'webdev', devto: 'webdev' },
  { id: 'programming', devto: 'programming' },
  { id: 'devops', devto: 'devops' },
  { id: 'typescript', devto: 'typescript' },
  { id: 'javascript', devto: 'javascript' },
  { id: 'machine-learning', devto: 'machinelearning' },
  { id: 'llm', devto: 'llm' },
  { id: 'ai-assisted-development', devto: 'ai' },
  { id: 'ai-automation', devto: 'automation' },
  { id: 'architecture', devto: 'architecture' },
  { id: 'testing', devto: 'testing' },
  { id: 'security', devto: 'security' },
  { id: 'opensource', devto: 'opensource' },
  { id: 'productivity', devto: 'productivity' },
  { id: 'career', devto: 'career' },
  { id: 'dotnet', devto: 'dotnet' },
  { id: 'csharp', devto: 'csharp' },
  { id: 'java', devto: 'java' },
  { id: 'php', devto: 'php' },
  { id: 'ci', devto: 'cicd' },
  { id: 'github-actions', devto: 'githubactions' },
  { id: 'developer-experience', devto: 'dx' },
  { id: 'cloudflare', devto: 'cloudflare' },
  { id: 'astro', devto: 'astro' },
  { id: 'shopware', devto: 'shopware' },
  { id: 'case-study' },
  { id: 'opinion' },
  { id: 'meta' },
  { id: 'foundry' },
  { id: 'jev' },
] as const satisfies readonly { id: string; devto?: string }[];

export type TagId = (typeof TAGS)[number]['id'];
export const TAG_IDS = TAGS.map((t) => t.id) as [TagId, ...TagId[]];
