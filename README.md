# yujungin.com

A personal, editorial-style tech blog — systems & engineering, with detours into math and physics. Built from the `design_handoff` reference (Editorial / Violet).

**Stack:** SvelteKit (Svelte 5 runes) · mdsvex (Markdown) · Shiki (code) · KaTeX (math) · `adapter-netlify` · fully prerendered (static).

---

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # static output → build/  (also wires Netlify functions)
pnpm preview      # serve the production build locally
pnpm check        # svelte-check (types)
pnpm test         # frontmatter schema + content validation (vitest)
```

## Writing a post

Drop a Markdown file in [`src/post/`](src/post). The filename (minus `.md`) becomes the URL slug — `my-post.md` → `/posts/my-post`. Frontmatter is validated with **Effect Schema** ([`src/lib/server/frontmatter.ts`](src/lib/server/frontmatter.ts)) — at build time and in CI ([`frontmatter.test.ts`](src/lib/server/frontmatter.test.ts)) — so a missing or malformed field fails and names the offending file.

```markdown
---
# required
title: Designing a write-ahead log that survives power loss
date: "2026-06-14" # ISO, quoted (YAML would otherwise parse it as a Date)
category: Systems
excerpt: One or two sentences used in listings, the post dek, and RSS.
# optional
featured: true # promotes it to the Home "Featured" slot
coverCaption: figure 1 — the durable write path # hero caption
cover: false # set false to hide the hero figure
draft: true # hides from listings, feed, and build
readTime: 8 min # overrides the automatic word-count estimate
---

Body in Markdown. The first paragraph gets the floated drop-cap automatically.
```

`readTime` is **auto-estimated** from word count (~200 wpm) — only add it to override.

Supported in the body:

- **Code** — fenced blocks (` ```rust `) are highlighted by Shiki with the design's dark theme. Languages preloaded in [`mdsvex.config.js`](mdsvex.config.js): rust, ts, js, bash, python, toml, sql, c, go, json, yaml, css, html, svelte, diff.
- **Math** — `$inline$` and `$$display$$` via KaTeX.
- **Pull quotes** — Markdown blockquotes (`>`) render as the centered editorial quote.

That's the whole workflow: add a file, commit, push. See [CONTENT.md](CONTENT.md) for where this can go next.

---

## Architecture

```
src/
├─ post/*.md                the posts (Markdown source — add / edit here)
├─ app.css                  Design tokens (CSS variables) + base + .wrap columns
├─ app.html                 Google Fonts (Newsreader / IBM Plex Sans / IBM Plex Mono)
├─ lib/
│  ├─ config.ts             Site identity, nav, social — all editable copy
│  ├─ types.ts              PostFrontmatter / PostMeta / YearGroup
│  ├─ server/posts.ts       getAllPosts() — Effect-validated frontmatter (server-only)
│  ├─ utils/{date,group}.ts shortDate / dottedDate / year / groupByYear
│  └─ components/
│     ├─ Header.svelte  Footer.svelte           global chrome
│     ├─ Eyebrow.svelte Byline.svelte Figure.svelte   shared primitives
│     ├─ FeaturedPost.svelte PostRow.svelte ArchiveRow.svelte  list items
│     ├─ PostNav.svelte                         prev / next pager
│     └─ Prose.svelte                           article-body reading styles
└─ routes/
   ├─ +layout.svelte/.ts    chrome + `prerender = true`
   ├─ +page.svelte/.server  Home (masthead · featured · latest)
   ├─ archive/+page.*       year-grouped index
   ├─ posts/[slug]/         +page.server (meta/prev/next, entries) + +page.ts (md component)
   ├─ about/  subscribe/    stubs
   ├─ rss.xml/+server.ts    RSS feed
   └─ +error.svelte         404 / error
```

**Content pipeline.** Listings, the post pages, and the feed all load through `src/lib/server/posts.ts` — server-only, so Effect Schema validates at build time and never ships to the browser. The post route splits the server load (validated meta + prev/next) from a thin universal load that imports the compiled Markdown component for hydration.

**Design tokens** live as CSS variables in `app.css` (colors, type families, widths, and the tweakable reading params `--prose-leading` / `--code-pad` / `--code-radius`). Components reference the variables, so re-theming (e.g. the blue sibling palette from the handoff) is a one-file change.

**Component split** follows the handoff's repeated patterns: primitives reused across views (`Eyebrow`, `Byline`, `Figure`), one component per list-row type, and `Prose` isolating all the `:global()` styling for mdsvex-rendered HTML. One-off layout (the hero, the archive header) stays inline in its route rather than being prematurely abstracted.

## CI / CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push to `main` and on pull requests:

1. **`validate`** — `pnpm check` (types), `pnpm test` (frontmatter schema + every post in `post/`), then `pnpm build`.
2. **`deploy`** — runs only after `validate` passes on `main`. Ships to Netlify with the Netlify CLI (`netlify deploy --build --prod`), which runs the same `@netlify/build` pipeline as a native Git deploy: the committed `netlify.toml` build command plus the adapter-netlify output (publish dir + the fallback function).

**One-time setup** in the GitHub repo → _Settings → Secrets and variables → Actions_:

| Secret               | Where to find it                                                  |
| -------------------- | ----------------------------------------------------------------- |
| `NETLIFY_AUTH_TOKEN` | Netlify → _User settings → Applications → Personal access tokens_ |
| `NETLIFY_SITE_ID`    | Netlify → _Site configuration → General → Site ID_                |

Because deploys now run from Actions, **turn off Netlify's own Git auto-builds** (Netlify → _Site configuration → Build & deploy → Continuous deployment → Stop builds_) so the two don't race. `netlify.toml` stays committed — the CLI build reads it.

Before going live, set the real values in [`src/lib/config.ts`](src/lib/config.ts) (`site.url`, social links) so canonical URLs and the RSS feed are correct.
