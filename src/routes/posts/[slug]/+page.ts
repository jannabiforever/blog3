import { error } from "@sveltejs/kit";
import type { PostModule } from "$lib/types";
import type { PageLoad } from "./$types";

/**
 * Universal load: imports the compiled markdown component (the client needs
 * it for hydration) and merges it with the validated meta/prev/next that the
 * server load already produced. Effect validation stays server-side.
 */
export const load: PageLoad = async ({ params, data }) => {
  let mod: PostModule;
  try {
    mod = await import(`../../../../docs/${params.slug}.md`);
  } catch {
    throw error(404, `Post “${params.slug}” not found`);
  }

  return { ...data, content: mod.default };
};
