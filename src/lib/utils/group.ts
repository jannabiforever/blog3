import type { PostMeta, YearGroup } from "$lib/types";
import { year } from "./date";

/**
 * Group posts by year, newest year first. Assumes `posts` is already
 * sorted newest-first, so each year's items keep that order.
 */
export function groupByYear(posts: PostMeta[]): YearGroup[] {
  const map = new Map<string, PostMeta[]>();
  for (const post of posts) {
    const y = year(post.date);
    (map.get(y) ?? map.set(y, []).get(y)!).push(post);
  }
  return [...map.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, items]) => ({ year, items }));
}
