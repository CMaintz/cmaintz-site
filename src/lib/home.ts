import { github } from './content';

export function recentRepos(n = 5) {
  return [...github.repos].sort((a, b) => b.pushedAt.localeCompare(a.pushedAt)).slice(0, n);
}
