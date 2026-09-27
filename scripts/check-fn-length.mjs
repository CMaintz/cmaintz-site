// Fails if any function in src/ or scripts/ is longer than MAX lines.
// Covers .ts/.mjs files, and the frontmatter + <script> blocks of .astro files.
import ts from 'typescript';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const MAX = Number(process.env.MAX_FN_LINES ?? 18);
const ROOTS = ['src', 'scripts'];
const EXTS = new Set(['.ts', '.mjs', '.astro']);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return EXTS.has(extname(full)) ? [full] : [];
  });
}

/** Code chunks of a file, each with the line offset where it starts. */
function chunks(file, text) {
  if (!file.endsWith('.astro')) return [{ code: text, offset: 0 }];
  const re = /^---\n([\s\S]*?)\n---|<script[^>]*>([\s\S]*?)<\/script>/gm;
  return [...text.matchAll(re)].map((m) => ({
    code: m[1] ?? m[2] ?? '',
    offset: text.slice(0, m.index).split('\n').length,
  }));
}

const isFunction = (n) => ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n);

function longFunctions(code) {
  const sf = ts.createSourceFile('x.ts', code, ts.ScriptTarget.Latest, true);
  const found = [];
  const visit = (node) => {
    if (isFunction(node)) {
      const start = sf.getLineAndCharacterOfPosition(node.getStart()).line;
      const end = sf.getLineAndCharacterOfPosition(node.getEnd()).line;
      if (end - start + 1 > MAX) found.push({ line: start + 1, length: end - start + 1 });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

function report(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return chunks(file, text).flatMap(({ code, offset }) =>
    longFunctions(code).map((f) => `${file}:${f.line + offset} function is ${f.length} lines (max ${MAX})`),
  );
}

const problems = ROOTS.flatMap(walk).flatMap(report);
problems.forEach((p) => console.log(p));
console.log(problems.length ? `\n${problems.length} function(s) too long` : `all functions <= ${MAX} lines`);
process.exit(problems.length ? 1 : 0);
