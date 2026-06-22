import { Schema } from "effect";

/**
 * Frontmatter is the content contract for every post in `/post/*.md`.
 *
 * It is validated with Effect Schema so a bad or missing field fails loudly,
 * pointing at the offending file — at build time (see `getAllPosts` in
 * `./posts`) and in CI (see `./frontmatter.test.ts`).
 */
export const Frontmatter = Schema.Struct({
  title: Schema.String,
  date: Schema.String.pipe(
    Schema.pattern(/^\d{4}-\d{2}-\d{2}$/, {
      message: () => 'must be an ISO date string like "2026-06-14" (quote it in YAML)',
    }),
  ),
  category: Schema.String,
  excerpt: Schema.String,
  /** Optional manual override; auto-estimated from word count when omitted. */
  readTime: Schema.optional(Schema.String),
  featured: Schema.optional(Schema.Boolean),
  coverCaption: Schema.optional(Schema.String),
  cover: Schema.optional(Schema.Boolean),
  draft: Schema.optional(Schema.Boolean),
});

/** The validated frontmatter shape, as consumed by listings and feeds. */
export type Frontmatter = typeof Frontmatter.Type;

/** Decode unknown metadata into validated frontmatter (throws `ParseError`). */
export const decodeFrontmatter = Schema.decodeUnknownSync(Frontmatter);
