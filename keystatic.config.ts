// Keystatic: the blog editor at /keystatic. Locally it edits files on disk; on the
// deployed site it commits through GitHub, one branch per post (post/<slug>), so a
// post goes live the way any change does: PR, gate, merge. The fields mirror the
// blog schema in src/content.config.ts.
import { config, collection, fields } from '@keystatic/core';
import { block, inline, mark, wrapper } from '@keystatic/core/content-components';
import { createElement } from 'react';
import { AREA_IDS, areas } from './src/data/areas';
import { CROSSPOST_TARGETS } from './src/data/crosspost';
import { TAGS } from './src/data/tags';

const storage = import.meta.env.DEV
  ? ({ kind: 'local' } as const)
  : ({ kind: 'github', repo: 'CMaintz/cmaintz-site', branchPrefix: 'post/' } as const);

const callout = wrapper({
  label: 'Callout',
  schema: {
    type: fields.select({
      label: 'Type',
      options: [
        { label: 'Note', value: 'note' },
        { label: 'Tip', value: 'tip' },
        { label: 'Warning', value: 'warn' },
      ],
      defaultValue: 'note',
    }),
    title: fields.text({ label: 'Title' }),
  },
});

const tex = fields.text({
  label: 'TeX',
  description: 'KaTeX syntax, without $ delimiters.',
  validation: { isRequired: true },
});
const math = block({ label: 'Math (block)', schema: { expr: tex } });
const inlineMath = inline({ label: 'Math (inline)', schema: { expr: tex } });
const kbd = mark({
  label: 'Keyboard key',
  tag: 'kbd',
  icon: createElement('span', { 'aria-hidden': true }, '⌨'),
  schema: {},
});

const postSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
  pubDate: fields.date({ label: 'Published', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
  updatedDate: fields.date({ label: 'Updated' }),
  tags: fields.multiselect({
    label: 'Tags',
    description: 'Tags with a dev.to name also go to dev.to; src/data/tags.ts says which four a post sends.',
    options: TAGS.map((t) => ({ label: 'devto' in t ? `${t.id} (dev.to: ${t.devto})` : t.id, value: t.id })),
  }),
  areas: fields.multiselect({
    label: 'Areas',
    options: AREA_IDS.map((id) => ({ label: areas[id].label.en, value: id })),
  }),
  lang: fields.select({
    label: 'Language',
    options: [
      { label: 'English', value: 'en' },
      { label: 'Danish', value: 'da' },
    ],
    defaultValue: 'en',
  }),
  translation: fields.relationship({
    label: 'Translation',
    description: 'The same post in the other language. Set it on both posts.',
    collection: 'blog',
  }),
  draft: fields.checkbox({ label: 'Draft (hidden on the site)', defaultValue: false }),
  cover: fields.image({ label: 'Cover image', directory: 'src/assets/blog', publicPath: '../../assets/blog/' }),
  comments: fields.checkbox({ label: 'Comments', defaultValue: true }),
  crosspost: fields.multiselect({
    label: 'Cross-post when published',
    description: 'Ticking a platform is the approval to post there (see scripts/crosspost.mjs).',
    options: CROSSPOST_TARGETS.map((t) => ({ label: t.label, value: t.id })),
  }),
  // Keystatic 0.6.9 keeps only the first word of a code fence's meta on save
  // (title="a b" -> title="a), which breaks Expressive Code titles.
  // patches/@keystatic+core+*.patch fixes it on postinstall. The patch targets a hashed
  // 0.6.9 chunk, so a Keystatic bump fails npm ci until it is regenerated or, once
  // upstream's proseMirrorToMDX stops using lang.split(' ', 2), deleted.
  content: fields.mdx({
    label: 'Content',
    extension: 'mdx',
    components: { Callout: callout, Math: math, InlineMath: inlineMath, kbd },
  }),
};

export default config({
  storage,
  ui: { brand: { name: 'maintz.dev' } },
  collections: {
    blog: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      columns: ['title', 'pubDate'],
      schema: postSchema,
    }),
  },
});
