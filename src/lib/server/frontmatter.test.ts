import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { decodeFrontmatter } from "./frontmatter";

/** A minimal object satisfying every required frontmatter field. */
const base = {
  title: "A title",
  date: "2026-06-14",
  category: "Systems",
  excerpt: "A one-line summary.",
};

describe("frontmatter schema", () => {
  it("accepts the required fields", () => {
    expect(() => decodeFrontmatter(base)).not.toThrow();
  });

  it("accepts every optional field", () => {
    expect(() =>
      decodeFrontmatter({
        ...base,
        readTime: "5 min",
        featured: true,
        cover: false,
        coverCaption: "figure — caption",
        draft: true,
      }),
    ).not.toThrow();
  });

  it.each(["title", "date", "category", "excerpt"] as const)(
    "rejects a missing required field: %s",
    (field) => {
      const partial = { ...base };
      delete (partial as Record<string, unknown>)[field];
      expect(() => decodeFrontmatter(partial)).toThrow();
    },
  );

  it.each(["2026-6-14", "June 14, 2026", "2026/06/14", "26-06-14"])(
    "rejects a non-ISO date: %s",
    (date) => {
      expect(() => decodeFrontmatter({ ...base, date })).toThrow();
    },
  );

  it("rejects a wrongly-typed optional field", () => {
    expect(() => decodeFrontmatter({ ...base, featured: "yes" })).toThrow();
  });
});

/** Raw markdown for every real post, keyed by path, read straight from disk. */
const posts = import.meta.glob("/src/docs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

describe("docs frontmatter", () => {
  it("discovers posts to validate", () => {
    expect(Object.keys(posts).length).toBeGreaterThan(0);
  });

  it.each(Object.entries(posts))("%s has valid frontmatter", (path, raw) => {
    const { data } = matter(raw);
    try {
      decodeFrontmatter(data);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid frontmatter in ${path}:\n${detail}`, { cause: error });
    }
  });
});
