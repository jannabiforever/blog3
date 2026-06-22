import { getAllPosts } from "$lib/server/posts";
import { groupByYear } from "$lib/utils/group";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const posts = await getAllPosts();
  return { groups: groupByYear(posts), count: posts.length };
};
