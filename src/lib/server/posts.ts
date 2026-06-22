import type { PostMeta, PostModule } from "$lib/types";
import { decodeFrontmatter, type Frontmatter } from "./frontmatter";

/**
 * Server-only post collection.
 *
 * Lives under `$lib/server` so SvelteKit guarantees it (and Effect) never
 * reach the client bundle — listings/feed load through `+page.server.ts`,
 * which run at build time for the prerendered site.
 *
 * Frontmatter is validated against the schema in `./frontmatter`, so a
 * bad/missing field fails the build loudly, pointing at the file.
 */

const postModules = import.meta.glob<PostModule>("/src/post/*.md");
const rawModules = import.meta.glob("/src/post/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const slugFromPath = (path: string) => path.split("/").pop()!.replace(/\.md$/, "");

/** Estimate reading time at ~200 wpm from the markdown body (frontmatter stripped). */
function estimateReadTime(raw: string): string {
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

/** All published posts, newest first, with validated frontmatter (drafts excluded). */
export async function getAllPosts(): Promise<PostMeta[]> {
  const entries = await Promise.all(
    Object.entries(postModules).map(async ([path, resolve]) => {
      const { metadata } = await resolve();

      let frontmatter: Frontmatter;
      try {
        frontmatter = decodeFrontmatter(metadata);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid frontmatter in ${path}:\n${detail}`, { cause: error });
      }

      const slug = slugFromPath(path);
      const readTime = frontmatter.readTime ?? estimateReadTime(rawModules[path] ?? "");
      return { ...frontmatter, slug, readTime } satisfies PostMeta;
    }),
  );

  return entries
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
