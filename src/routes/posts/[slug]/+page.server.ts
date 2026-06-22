import { error } from "@sveltejs/kit";
import { getAllPosts } from "$lib/server/posts";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const posts = await getAllPosts();
  const index = posts.findIndex((p) => p.slug === params.slug);
  if (index === -1) throw error(404, `Post “${params.slug}” not found`);

  return {
    meta: posts[index],
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
};

// Enumerate every post so each reading page is prerendered.
export const entries: EntryGenerator = async () => {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
};
