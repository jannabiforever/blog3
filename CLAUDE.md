# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`jungin.dev` (`yujungin.com`) — a personal, editorial-style tech blog. SvelteKit (Svelte 5 runes) + mdsvex, fully prerendered to a static site, deployed on Netlify. Package manager is **pnpm** (Node 22).

## Commands

```bash
pnpm dev            # dev server → http://localhost:5173
pnpm build          # static build → build/ (also wires the adapter-netlify fallback fn)
pnpm preview        # serve the production build locally
pnpm check          # svelte-kit sync + svelte-check (types); check:watch for watch mode
pnpm test           # vitest run — frontmatter schema + validates EVERY post in src/post
pnpm test:watch     # vitest watch
pnpm lint           # prettier --check . && eslint .
pnpm format         # prettier --write .
```

Run a single test by name: `pnpm exec vitest run -t "rejects a non-ISO date"` (or pass a file path). The CI gate is `check → lint → test → build`; run those four before assuming a change is green.

## Architecture

**Static-first.** `src/routes/+layout.ts` sets `prerender = true` and `trailingSlash = "never"` globally, so every route — including `rss.xml` — is generated at build time. There is no runtime server; `adapter-netlify` only ships a fallback function.

**`getAllPosts()` is the single content choke point.** Home, Archive, RSS, prev/next pagers, and the prerender `entries` generator all read through `src/lib/server/posts.ts`. It loads `src/post/*.md` via `import.meta.glob`, validates each file's frontmatter, filters drafts, and returns posts newest-first. Change sorting/filtering here and every surface updates. It lives under `$lib/server` specifically so **Effect (the validator) never enters the client bundle**.

**Frontmatter is an enforced contract** (`src/lib/server/frontmatter.ts`, Effect Schema). A bad/missing field fails the **build** loudly, naming the file and field — and the same `decodeFrontmatter` is exercised in `frontmatter.test.ts` against every real post, so CI catches it too.

- Required: `title`, `date`, `category`, `excerpt`.
- Optional: `readTime`, `featured`, `coverCaption`, `cover`, `draft`.
- `date` **must be a quoted ISO string** (`date: "2026-06-14"`). Unquoted, YAML parses it as a Date and the string-pattern check fails.
- `readTime` is auto-estimated (~200 wpm from the body) when omitted; the field is an override only.

**The post route is deliberately split** (`src/routes/posts/[slug]/`):

- `+page.server.ts` — server-only: validated `meta` + `prev`/`next`, plus the `entries` generator that enumerates slugs for prerendering. Keeps Effect server-side.
- `+page.ts` — universal: re-resolves the compiled markdown **component** via `import.meta.glob` so it works on both server render and client hydration (the body Component isn't serializable, so it must be reconstructed, not passed through `data`).

**mdsvex pipeline** (`mdsvex.config.js`, wired in `svelte.config.js` via `extensions: [".svelte", ".md"]`):

- Code: Shiki, theme `one-dark-pro`. Languages are **preloaded** in the `LANGS` array — add a language there before using it in a fence, or it falls back to plain text.
- Math: a custom `rehypeKatex` plugin renders `$inline$` / `$$display$$` at the rehype/HAST stage. This is a workaround — mdsvex 0.12 ships the legacy remark parser, so remark-math's micromark extension never fires. KaTeX output has its `{`/`}` escaped to HTML entities so Svelte doesn't read them as expression delimiters. Touch this carefully.

**Design tokens** are Tailwind v4 `@theme` declarations in `src/app.css` (colors, type families, animation) — re-theming is a one-file change. `@tailwindcss/typography` is enabled. `Prose.svelte` isolates the `:global()` styling for mdsvex-rendered article HTML.

**Site identity / copy** lives in `src/lib/config.ts` (`site`, `author`, nav, socials). `site.url` feeds canonical links and the RSS feed — keep it correct.

See `README.md` for the full file tree and the authoring workflow, and `CONTENT.md` for the (aspirational) content-management roadmap — note CONTENT.md predates a rename and refers to `src/content/posts/` and `src/lib/posts.ts`, which are now `src/post/` and `src/lib/server/posts.ts`.

## Conventions & gotchas

- **Adding a post**: drop a `.md` in `src/post/` (filename minus `.md` = URL slug), commit, push. No registration step.
- **pnpm only** — CI uses `--frozen-lockfile`; don't introduce an npm/yarn lockfile.
- **`types.ts` duplicates the schema.** `PostFrontmatter` in `src/lib/types.ts` is hand-kept in sync with the Effect schema in `frontmatter.ts`. When you add a frontmatter field, update **both** (the schema is the source of truth at runtime; the interface is what TS/components see).
- **CI/CD** (`.github/workflows/ci.yml`): `validate` runs on every push/PR; `deploy` runs only on `main` and ships via the Netlify CLI. Netlify's own Git auto-builds are intentionally disabled so the two don't race — don't re-enable them.
