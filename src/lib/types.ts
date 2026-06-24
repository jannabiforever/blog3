import type { Component } from "svelte";

/** Frontmatter as authored in `src/post/*.md` (no slug yet). */
export interface PostFrontmatter {
  title: string;
  /** ISO date, quoted in YAML: "2026-06-14". */
  date: string;
  category: string;
  excerpt: string;
  /** Optional manual override; auto-estimated from word count when omitted. */
  readTime?: string;
  /** Caption shown beneath the hero image. */
  coverCaption?: string;
  /** Path to the hero image (e.g. "/covers/slug.webp"); omit to hide the hero. */
  coverImage?: string;
  /** Hide from listings and feeds while writing. */
  draft?: boolean;
}

/** Post metadata used by listings (frontmatter + derived slug; readTime always resolved). */
export interface PostMeta extends PostFrontmatter {
  slug: string;
  readTime: string;
}

/** A compiled markdown module as produced by mdsvex. */
export interface PostModule {
  default: Component;
  metadata: PostFrontmatter;
}

/** Posts bucketed by year for the Archive view. */
export interface YearGroup {
  year: string;
  items: PostMeta[];
}
