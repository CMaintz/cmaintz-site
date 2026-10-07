
const BOUNDARY = /[\s/\-_.,:()]/;

const isWordStart = (s: string, i: number) => i === 0 || BOUNDARY.test(s[i - 1]);

function wordPrefixAt(q: string, s: string) {
  for (let i = s.indexOf(q); i >= 0; i = s.indexOf(q, i + 1)) if (isWordStart(s, i)) return i;
  return -1;
}

/**
 * Number of separate runs `q` splits into across `s`, or -1. Every query char must continue
 * the previous hit or start a new word, so "tatl" finds "Tech Atlas" but scattered letters don't.
 */
function wordRuns(q: string, s: string) {
  let runs = 0,
    prev = -2;
  for (const ch of q) {
    let j = s.indexOf(ch, prev + 1);
    while (j >= 0 && j !== prev + 1 && !isWordStart(s, j)) j = s.indexOf(ch, j + 1);
    if (j < 0) return -1;
    if (j !== prev + 1) runs++;
    prev = j;
  }
  return runs;
}

/** Higher is better, -1 is no match. Prose (`fuzzy: false`) only matches whole-word prefixes and substrings. */
export function matchScore(q: string, text: string, fuzzy = true) {
  const s = text.toLowerCase();
  if (!q || !s) return -1;
  const at = wordPrefixAt(q, s);
  if (at >= 0) return (at === 0 ? 30 : 20) + q.length - s.length * 0.01;
  if (q.length >= 3 && s.includes(q)) return 10 + q.length - s.length * 0.01;
  const runs = fuzzy ? wordRuns(q, s) : -1;
  return runs < 0 ? -1 : Math.max(1, 5 + q.length - runs * 2) - s.length * 0.01;
}
