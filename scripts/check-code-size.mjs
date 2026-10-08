// Code-size rules for src/, scripts/ and redirect-www/:
//   - no function longer than MAX_FN_LINES (default 18)
//   - no code file longer than MAX_FILE_LINES (default 300)
//   - no function named like it does two things ("fooAndBar")
// Functions are checked in .ts/.mjs files and in .astro frontmatter + <script> blocks.
import ts from 'typescript';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const MAX = Number(process.env.MAX_FN_LINES ?? 18);
const MAX_FILE = Number(process.env.MAX_FILE_LINES ?? 300);
const ROOTS = ['src', 'scripts', 'redirect-www'];
const EXTS = new Set(['.ts', '.mjs', '.js', '.astro', '.css']);

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

const nameOf = (n) => n.name?.getText?.() ?? (ts.isVariableDeclaration(n.parent) ? n.parent.name.getText() : '');
const TWO_THINGS = /[a-z]And[A-Z]/;

function badNames(code) {
  const sf = ts.createSourceFile('x.ts', code, ts.ScriptTarget.Latest, true);
  const found = [];
  const visit = (node) => {
    if (isFunction(node) && TWO_THINGS.test(nameOf(node)))
      found.push({ line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, name: nameOf(node) });
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

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

function functionProblems(file, text) {
  if (file.endsWith('.css')) return [];
  return chunks(file, text).flatMap(({ code, offset }) => [
    ...longFunctions(code).map((f) => `${file}:${f.line + offset} function is ${f.length} lines (max ${MAX})`),
    ...badNames(code).map((f) => `${file}:${f.line + offset} "${f.name}" sounds like two functions`),
  ]);
}

function fileProblems(file, text) {
  const lines = text.split('\n').length;
  return lines > MAX_FILE ? [`${file} is ${lines} lines (max ${MAX_FILE})`] : [];
}

function report(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return [...fileProblems(file, text), ...functionProblems(file, text)];
}

const problems = ROOTS.flatMap(walk).flatMap(report);
problems.forEach((p) => console.log(p));
console.log(problems.length ? `\n${problems.length} problem(s)` : `all functions <= ${MAX} lines, all files <= ${MAX_FILE} lines`);
process.exit(problems.length ? 1 : 0);
