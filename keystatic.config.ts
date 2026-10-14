// Keystatic: the blog editor at /keystatic. Locally it edits files on disk; on the
// deployed site it commits through GitHub, one branch per post (post/<slug>), so a
// post goes live the way any change does: PR, gate, merge. The fields mirror the
// blog schema in src/content.config.ts.
import { config, collection, fields } from '@keystatic/core';
import { wrapper } from '@keystatic/core/content-components';
import { AREA_IDS, areas } from './src/data/areas';
import { CROSSPOST_TARGETS } from './src/data/crosspost';

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

const postSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
  pubDate: fields.date({ label: 'Published', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
  updatedDate: fields.date({ label: 'Updated' }),
  tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags', itemLabel: (p) => p.value }),
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
  draft: fields.checkbox({ label: 'Draft (hidden on the site)', defaultValue: false }),
  cover: fields.image({ label: 'Cover image', directory: 'src/assets/blog', publicPath: '../../assets/blog/' }),
  comments: fields.checkbox({ label: 'Comments', defaultValue: true }),
  crosspost: fields.multiselect({
    label: 'Cross-post when published',
    description: 'Ticking a platform is the approval to post there (see scripts/crosspost.mjs).',
    options: CROSSPOST_TARGETS.map((t) => ({ label: t.label, value: t.id })),
  }),
  content: fields.mdx({ label: 'Content', extension: 'mdx', components: { Callout: callout } }),
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
