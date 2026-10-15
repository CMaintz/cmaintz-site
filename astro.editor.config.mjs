// @ts-check
// `npm run editor`: the site with the Node adapter, so /keystatic can edit files on disk.
// Keystatic's local mode needs Node's fs, which the Cloudflare dev server (workerd) doesn't have.
import node from '@astrojs/node';
import site from './astro.config.mjs';

export default { ...site, adapter: node({ mode: 'standalone' }) };
