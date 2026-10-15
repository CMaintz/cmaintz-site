// Minimal static server for dist/client - used by the screenshot and CV-PDF
// scripts so they don't need the Workers runtime. Not for production.
// Applies dist/client/_headers like Cloudflare does, so the smoke test runs
// under the real security headers (CSP included).
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

/** Parses a Cloudflare `_headers` file into [pattern, headers] rules. */
async function loadHeaderRules() {
  const text = await readFile(join(ROOT, '_headers'), 'utf8').catch(() => '');
  const rules = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('/')) rules.push([line.trim(), {}]);
    else if (line.trim() && rules.length) {
      const i = line.indexOf(':');
      rules.at(-1)[1][line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}

const ruleMatches = (pattern, path) =>
  pattern.endsWith('*') ? path.startsWith(pattern.slice(0, -1)) : path === pattern;

/** Every matching rule's headers, merged (later rules win). */
const headersFor = (rules, path) => Object.assign({}, ...rules.filter(([p]) => ruleMatches(p, path)).map(([, h]) => h));

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

/** Unknown paths fall back to the built 404 page (with a 404 status). */
async function respond(rules, req, res) {
  const file = (await resolveFile(req.url ?? '/')) ?? join(ROOT, '404.html');
  const is404 = file.endsWith('404.html') && !req.url?.includes('404');
  try {
    const body = await readFile(file);
    const type = TYPES[extname(file)] ?? 'application/octet-stream';
    res.writeHead(is404 ? 404 : 200, { ...headersFor(rules, (req.url ?? '/').split('?')[0]), 'content-type': type });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}

export async function serve(port = 4322) {
  const rules = await loadHeaderRules();
  const server = createServer((req, res) => respond(rules, req, res));
  return new Promise((r) => server.listen(port, () => r(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4322);
  await serve(port);
  console.log(`dist/client on http://localhost:${port}`);
}
