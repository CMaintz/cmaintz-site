// The blog's tag vocabulary: the Keystatic picker, the content schema and the
// dev.to cross-post all read this list. `id` is the site's tag (/blog/tags/<id>);
// `devto` is the tag it becomes on dev.to, which allows four lowercase alphanumeric
// tags per post. Readers there follow established tags, so a site tag without a
// well-followed equivalent maps to none. The order is dev.to priority, roughly by
// dev.to popularity: a post sends the first four distinct dev.to tags its own tags
// map to, in this order.
export const TAGS = [
  { id: 'ai', devto: 'ai' },
  { id: 'webdev', devto: 'webdev' },
  { id: 'programming', devto: 'programming' },
  { id: 'javascript', devto: 'javascript' },
  { id: 'productivity', devto: 'productivity' },
  { id: 'devops', devto: 'devops' },
  { id: 'opensource', devto: 'opensource' },
  { id: 'security', devto: 'security' },
  { id: 'career', devto: 'career' },
  { id: 'opinion', devto: 'discuss' },
  { id: 'ai-automation', devto: 'automation' },
  { id: 'machine-learning', devto: 'machinelearning' },
  { id: 'architecture', devto: 'architecture' },
  { id: 'typescript', devto: 'typescript' },
  { id: 'java', devto: 'java' },
  { id: 'llm', devto: 'llm' },
  { id: 'testing', devto: 'testing' },
  { id: 'ecommerce', devto: 'ecommerce' },
  { id: 'php', devto: 'php' },
  { id: 'dotnet', devto: 'dotnet' },
  { id: 'csharp', devto: 'csharp' },
  { id: 'ai-assisted-development', devto: 'ai' },
  { id: 'developer-experience', devto: 'tooling' },
  { id: 'ci', devto: 'cicd' },
  { id: 'github-actions', devto: 'githubactions' },
  { id: 'cloudflare', devto: 'cloudflare' },
  { id: 'astro', devto: 'astro' },
  { id: 'case-study' },
  { id: 'shopware' },
  { id: 'meta' },
  { id: 'foundry' },
  { id: 'jev' },
] as const satisfies readonly { id: string; devto?: string }[];

export type TagId = (typeof TAGS)[number]['id'];
export const TAG_IDS = TAGS.map((t) => t.id) as [TagId, ...TagId[]];

/**
 * A tag page is indexed once it lists this many posts in its language. Thinner ones
 * carry `noindex, follow` and stay out of the sitemap (src/lib/thin-tags.ts).
 */
export const MIN_TAG_POSTS = 3;
export const isThinTag = (postCount: number) => postCount < MIN_TAG_POSTS;
