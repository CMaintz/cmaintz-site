import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postPath } from '../lib/content';
import { site } from '../data/site';

export async function GET(context: APIContext) {
  const posts = await getPosts('en');
  return rss({
    title: `${site.name} - blog`,
    description: site.description.en,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      categories: p.data.tags,
      link: postPath(p),
    })),
    customData: '<language>en</language>',
  });
}
