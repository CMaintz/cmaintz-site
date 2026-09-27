#!/usr/bin/env node
// Snapshot public GitHub repo metadata + rendered READMEs into src/data/github.json.
// Deterministic and offline-safe: the build reads the committed snapshot; run
// `npm run sync` (or the scheduled CI job) to refresh it.
//
// Auth: GITHUB_TOKEN env var, else `gh auth token`. Unauthenticated works for
// REST but GraphQL needs a token, so one is required.
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOGIN = process.env.GITHUB_LOGIN ?? 'CMaintz';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/github.json');

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch {
    console.error('No GITHUB_TOKEN and `gh auth token` failed - cannot sync.');
    process.exit(1);
  }
}
const TOKEN = token();
const headers = { Authorization: `Bearer ${TOKEN}`, 'User-Agent': 'cmaintz-site-sync' };

const QUERY = `query($login: String!) {
  user(login: $login) {
    name bio avatarUrl url followers { totalCount }
    pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { name } } }
    repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        name description url homepageUrl isFork isArchived
        stargazerCount forkCount pushedAt createdAt
        openGraphImageUrl usesCustomOpenGraphImage
        licenseInfo { spdxId }
        primaryLanguage { name color }
        languages(first: 8, orderBy: {field: SIZE, direction: DESC}) { totalSize edges { size node { name color } } }
        repositoryTopics(first: 20) { nodes { topic { name } } }
        defaultBranchRef { name }
      }
    }
  }
}`;

async function graphql() {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.user;
}

// GitHub renders README HTML with its own (sanitized) pipeline. Relative links
// and images are rewritten to absolute URLs so they work off-GitHub.
async function fetchReadmeHtml(repo) {
  const res = await fetch(`https://api.github.com/repos/${LOGIN}/${repo}/readme`, {
    headers: { ...headers, Accept: 'application/vnd.github.html+json' },
  });
  return res.ok ? res.text() : null;
}

function absolutizeLinks(html, repo, branch) {
  const blob = `https://github.com/${LOGIN}/${repo}/blob/${branch}/`;
  const raw = `https://raw.githubusercontent.com/${LOGIN}/${repo}/${branch}/`;
  return (
    html
      .replace(/(<img[^>]*?\ssrc=")(?!https?:|data:|\/\/)\.?\/?([^"]+)"/g, `$1${raw}$2"`)
      .replace(/(<a[^>]*?\shref=")(?!https?:|#|mailto:|\/\/)\.?\/?([^"]+)"/g, `$1${blob}$2"`)
      // GitHub's user-content anchor prefix breaks in-page links outside github.com.
      .replace(/id="user-content-/g, 'id="')
  );
}

/** Site style rule: plain hyphens only, no em/en dashes. */
const DASHES = new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`, 'g'); // en + em dash
const normalizeDashes = (text) => text.replace(DASHES, '-');

function languageShares(langs) {
  return langs.edges.map((e) => ({
    name: e.node.name,
    color: e.node.color,
    share: langs.totalSize ? e.size / langs.totalSize : 0,
  }));
}

function repoMetadata(r) {
  return {
    name: r.name,
    description: normalizeDashes(r.description ?? ''),
    url: r.url,
    homepage: r.homepageUrl || null,
    archived: r.isArchived,
    stars: r.stargazerCount,
    forks: r.forkCount,
    pushedAt: r.pushedAt,
    createdAt: r.createdAt,
    license: r.licenseInfo?.spdxId ?? null,
    ogImage: r.usesCustomOpenGraphImage ? r.openGraphImageUrl : null,
    language: r.primaryLanguage,
    languages: languageShares(r.languages),
    topics: r.repositoryTopics.nodes.map((t) => t.topic.name),
  };
}

async function toRepo(r) {
  const html = await fetchReadmeHtml(r.name);
  const readme = html && normalizeDashes(absolutizeLinks(html, r.name, r.defaultBranchRef?.name ?? 'main'));
  return { ...repoMetadata(r), readmeHtml: readme };
}

function buildSnapshot(user, repos) {
  return {
    syncedAt: new Date().toISOString(),
    login: LOGIN,
    profile: { name: user.name, bio: user.bio, avatarUrl: user.avatarUrl, url: user.url, followers: user.followers.totalCount },
    pinned: user.pinnedItems.nodes.map((n) => n.name),
    repos,
  };
}

const user = await graphql();
const repos = await Promise.all(user.repositories.nodes.filter((r) => !r.isFork).map(toRepo));
console.log(`fetched ${repos.length} READMEs`);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(buildSnapshot(user, repos), null, 2) + '\n');
console.log(`\nSynced ${repos.length} repos -> ${OUT}`);
