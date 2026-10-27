import { expect, it } from 'vitest';
import { findExperience, type Fact } from './assistant-experience';

const facts: Fact[] = [
  { kind: 'project', title: 'Web app', text: 'Built with JavaScript and Node.js', path: '/projects/web/' },
  { kind: 'project', title: 'Desktop tool', text: 'C# and .NET 8, WPF', path: '/projects/desk/' },
  { kind: 'job', title: 'Consultant', text: 'Docker, Kubernetes and Azure Pipelines', path: '/about/' },
  { kind: 'skill', title: 'Languages', text: 'TypeScript, Go, Rust', path: '/services/' },
];

const found = (term: string) => findExperience({ terms: [term] }, facts).results[0];

it('findExperience: finds a technology and points at the page that proves it', () => {
  expect(found('kubernetes')).toMatchObject({ found: true, evidence: [{ title: 'Consultant', path: '/about/' }] });
});

it('findExperience: does not count JavaScript as Java experience', () => {
  expect(found('Java').found).toBe(false);
});

it('findExperience: does not count C# as C experience', () => {
  expect(found('C').found).toBe(false);
});

it('findExperience: matches names with symbols, like C# and .NET', () => {
  expect(found('C#').found).toBe(true);
  expect(found('.NET').found).toBe(true);
});

it('findExperience: says plainly when nothing on the site mentions a term', () => {
  expect(found('Haskell')).toEqual({ term: 'Haskell', found: false, shipped: false, evidence: [] });
});

it('findExperience: does not count a listed skill as shipped work', () => {
  expect(found('Rust')).toMatchObject({ found: true, shipped: false });
  expect(found('Kubernetes')).toMatchObject({ found: true, shipped: true });
});

it('findExperience: ignores input that is not a list of strings', () => {
  expect(findExperience({ terms: 'Docker' }, facts).results).toEqual([]);
});
