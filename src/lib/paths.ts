import { getProjects, getPosts, allTags } from './content';
import { AREA_IDS } from '../data/areas';

export async function projectPaths() {
  const projects = await getProjects();
  return projects.map((project, i) => ({
    params: { slug: project.id },
    props: { project, prev: projects[i - 1], next: projects[i + 1] },
  }));
}

export async function postPaths() {
  const posts = await getPosts();
  return posts.map((post, i) => ({
    params: { slug: post.id },
    // Posts are newest-first, so "previous" is the next-older post.
    props: { post, prev: posts[i + 1], next: posts[i - 1] },
  }));
}

export async function tagPaths() {
  const posts = await getPosts();
  return allTags(posts).map(([tag]) => ({
    params: { tag },
    props: { tag, posts: posts.filter((p) => p.data.tags.includes(tag)) },
  }));
}

export function areaPaths() {
  return AREA_IDS.map((area) => ({ params: { area }, props: { area } }));
}
