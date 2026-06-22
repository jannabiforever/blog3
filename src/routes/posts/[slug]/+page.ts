import { error } from "@sveltejs/kit";
import type { PostModule } from "$lib/types";
import type { PageLoad } from "./$types";

// Static map of compiled markdown components. Using import.meta.glob (root-
// absolute) instead of a relative dynamic import makes Vite resolve these
// reliably on BOTH server and client — the client re-runs this load on
// hydration to reconstruct the (non-serializable) body component.
const posts = import.meta.glob<PostModule>("/src/docs/*.md");

/**
 * Universal load: resolves the compiled markdown component for this slug and
 * merges it with the validated meta/prev/next from the server load. Effect
 * validation stays server-side (see +page.server.ts).
 */
export const load: PageLoad = async ({ params, data }) => {
  const importer = posts[`/src/docs/${params.slug}.md`];
  if (!importer) throw error(404, `Post “${params.slug}” not found`);

  const mod = await importer();
  return { ...data, content: mod.default };
};
