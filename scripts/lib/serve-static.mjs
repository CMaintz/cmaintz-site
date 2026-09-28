// Minimal static server for dist/client - used by the screenshot and CV-PDF
// scripts so they don't need the Workers runtime. Not for production.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist/client');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
  '.pf_meta': 'application/octet-stream',
  '.pf_fragment': 'application/octet-stream',
  '.pf_index': 'application/octet-stream',
  '.pagefind': 'application/octet-stream',
};

async function resolveFile(urlPath) {
  const p = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^([/\\])+/, '');
  for (const cand of [p, join(p, 'index.html'), `${p}.html`]) {
    const full = join(ROOT, cand);
    if (!full.startsWith(ROOT)) return null;
    try {
      if ((await stat(full)).isFile()) return full;
    } catch {}
  }
  return null;
}

export function serve(port = 4322) {
  const server = createServer(async (req, res) => {
    const file = (await resolveFile(req.url ?? '/')) ?? join(ROOT, '404.html');
    const is404 = file.endsWith('404.html') && !req.url?.includes('404');
    try {
      const body = await readFile(file);
      res.writeHead(is404 ? 404 : 200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4322);
  await serve(port);
  console.log(`dist/client on http://localhost:${port}`);
}
