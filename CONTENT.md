# Content management — brainstorm & roadmap

How `yujungin.com` should manage content as it grows. This is a thinking document, not a spec: it lays out the current model, the realistic options, and a recommended path with the trade-offs spelled out so the decisions stay yours.

Context that shapes every recommendation below: **one author, infrequent-but-crafted long-form posts, code- and math-heavy, comfortable with git, deployed static on Netlify.** That profile pulls hard toward "keep it simple and in-repo" and away from heavyweight CMS infrastructure.

---

## TL;DR recommendation

1. **Stay with Markdown-in-repo** as the source of truth (what's built today). Git _is_ your CMS: versioned, diffable, offline, zero lock-in, free.
2. **Harden the content contract** — _done (this round)_: frontmatter is validated at build time with **Effect Schema** and read-time is auto-derived. See §3.
3. **Add a light editing GUI only if/when writing-from-the-couch friction is real** — and when you do, choose a _git-based_ CMS (Sveltia/Decap) so the files stay the truth. Don't reach for a headless SaaS CMS unless a non-technical author or multi-device rich editing becomes a hard requirement.
4. **Grow the content model deliberately** (tags → series → search) rather than all at once.

The rest is detail and justification.

---

## 1. The current model (Tier 0: git-as-CMS)

```
src/content/posts/*.md   →  import.meta.glob (build time)  →  prerendered HTML
        ▲                          │
   frontmatter                getAllPosts()  ← single source of truth (src/lib/posts.ts)
   (the contract)                  │
                          listings · archive · RSS · prev/next
```

- **Authoring** = add a `.md` file, commit, push. Netlify rebuilds. No moving parts.
- **One choke point**: every surface (Home, Archive, RSS, prev/next) reads `getAllPosts()`. Change sorting/filtering once, everywhere updates.
- **Frontmatter is the schema** (`src/lib/types.ts`). It's currently a _convention_ — nothing enforces it. That's the first thing worth fixing (§3).

**Why this is the right default, not a placeholder:** for a solo technical writer, a database/CMS is mostly overhead. Markdown gives you version history, PR-based drafting, local preview, grep, and portability. Big technical blogs (and most of the SvelteKit ecosystem's own sites) run exactly this way.

**Where it strains:** writing on a phone/tablet, a non-technical contributor, or wanting scheduled publishing without a commit at that moment. Those are the triggers to move up a tier — not before.

---

## 2. The decision that matters most: where does content _live_?

|                                | **Tier 0 — Markdown in repo** _(now)_ | **Tier 1 — Git-based CMS**         | **Tier 2 — Headless CMS (SaaS)**           |
| ------------------------------ | ------------------------------------- | ---------------------------------- | ------------------------------------------ |
| Examples                       | this repo                             | Sveltia CMS, Decap, TinaCMS        | Sanity, Contentful, Hygraph, Notion-as-CMS |
| Source of truth                | `.md` in git                          | `.md` in git (GUI writes commits)  | external DB / API                          |
| Edit anywhere (mobile/web GUI) | ✗ (editor + git)                      | ✓ (browser admin)                  | ✓✓ (polished apps)                         |
| Non-technical authors          | ✗                                     | ◑                                  | ✓                                          |
| Rich media / asset pipeline    | manual                                | basic                              | ✓ (built-in CDN)                           |
| Versioning                     | git (free)                            | git (free)                         | proprietary history                        |
| Build coupling                 | none                                  | none                               | needs fetch + often webhooks               |
| Lock-in / cost                 | none / free                           | none / free                        | real / metered                             |
| Ongoing ops                    | none                                  | tiny                               | account, keys, schema migrations           |
| Fit for _this_ blog            | **strong**                            | good _if_ mobile editing is wanted | overkill unless requirements change        |

**Recommendation:** stay Tier 0; pre-decide that the upgrade path, if taken, is **Tier 1 (Sveltia/Decap)** — because it keeps Markdown-in-git as truth, so adopting or dropping it is reversible and changes nothing about the rendering pipeline. Tier 2 is a one-way door; only walk through it for requirements you don't have yet (a non-technical co-author, a large media library, content reused across multiple front-ends).

> Note on **Notion-as-CMS**: tempting because you may already write there. But it means a runtime/build-time API dependency, image-URL expiry headaches, and lossy Markdown conversion (callouts, code, math). For a math/code blog, the fidelity loss alone is disqualifying. Skip.

---

## 3. Harden the content contract ✅ (implemented this round)

A bad `date:` or missing `excerpt:` used to fail late or silently. Now there's a **build-time schema check** so content errors fail loud, locally:

- The post schema is defined once with **Effect Schema** in [`src/lib/server/posts.ts`](src/lib/server/posts.ts) and every file's frontmatter is parsed in `getAllPosts()`. On failure the build throws with the filename + the exact bad field (e.g. _"Invalid frontmatter in /src/docs/x.md: must be an ISO date string…"_).
- It lives under `$lib/server`, so **Effect never reaches the client bundle** — validation runs at build time for the prerendered site.
- **`readTime` is auto-derived** from word count (~200 wpm); the frontmatter field is now an optional override only.

Still open in this area (not done): unique-slug check, and deriving `PostMeta` directly from the schema type to remove the hand-kept duplicate in `types.ts`.

Payoff: the frontmatter stops being tribal knowledge and becomes an enforced contract — which is also exactly what any future CMS (Tier 1/2) needs to generate its editing form from.

---

## 4. Evolve the content model

The handoff models a post as `{ title, date, category, readTime, excerpt }`. Natural next fields, roughly in order of usefulness here:

1. **Tags** (many per post) alongside the single `category`. Add `tags: [..]` → generate `/tags/[tag]` index pages (the Archive grouping logic generalizes cleanly). Best discoverability win for a varied systems/math/physics catalog.
2. **Series / multi-part** (`series: "Write-ahead logs"`, `part: 2`) — you write deep topics; series boxes ("Part 2 of 4") add real navigation value and reading time.
3. **Canonical / cross-post** (`canonicalUrl`) if you ever mirror to dev.to / Medium — protects SEO.
4. **Updated date** (`updated:`) — show "Updated Jun 2026" on evergreen technical posts.
5. **Category taxonomy**: today categories are free text. Once there are ~15 posts, pin them to a defined list (a `categories.ts`) so casing/labels stay consistent and you can give each a color/landing page.

Keep each addition driven by a real need; an over-modeled post is its own kind of debt.

---

## 5. Media & images

Currently figures are CSS striped placeholders (`Figure.svelte` already accepts a real `src`). Plan for real diagrams (a systems blog lives on them):

- **Co-locate** images with posts and let Vite fingerprint/optimize them, or keep simple ones in `static/`. For many/large images, add **`@sveltejs/enhanced-img`** (resizing, modern formats, lazy-loading) — meaningful for diagram-heavy posts.
- **Diagrams as code**: you'll likely want **Mermaid / D2 / Excalidraw** for architecture figures. Recommended approach: render to **SVG at build time** (a small remark/rehype step or commit the exported SVG) rather than shipping a client-side renderer — keeps pages static and fast.
- **Code-block captions**: the handoff shows captioned `<figure>` code blocks (e.g. _"append.rs — the order is the whole game"_). Not yet wired (mdsvex's legacy parser drops fence `meta`). Add via a small rehype step that reads ` ```rust title="append.rs" ` → wraps `<pre>` in `<figure><figcaption>`. Nice-to-have.

---

## 6. Drafts, dates & scheduling

- **Drafts**: `draft: true` already hides from listings/feed/build. For "preview drafts on a deployed URL," add an env flag (`PUBLIC_SHOW_DRAFTS`) that includes drafts on Netlify _preview_ deploys but not production.
- **Scheduling** (publish at a future date without committing then): static builds can't self-update, so use a **Netlify scheduled build** (daily cron) + a `date > today` filter in `getAllPosts()`. The post sits in the repo with a future date and goes live on the next scheduled build after that date.

---

## 7. Discoverability & SEO

- **RSS** — done (`/rss.xml`). Add `<link rel="alternate">` in `app.html` so readers autodiscover it.
- **Sitemap + robots.txt** — add `sitemap.xml` (same prerendered-endpoint pattern as RSS). Easy SEO win.
- **Per-page meta / Open Graph / Twitter cards** — centralize a `<SEO>` component (title, description, canonical, `og:image`). Today only `<title>`/`description` are set.
- **OG images** — auto-generate per-post share images (Satori/`@vercel/og`-style, or a prerendered SVG→PNG step) using the post title in Newsreader. High polish-per-effort for link sharing.
- **Search** — at ~30+ posts add client-side search over a prebuilt JSON index (**Pagefind** is ideal for static sites and needs almost no wiring; **Fuse.js** if you want full control). Don't add a search service.

---

## 8. Engagement (optional, opt-in)

- **Newsletter** — `/subscribe` is a stubbed form. Wire to a provider when wanted: **Buttondown** (developer-friendly, RSS-to-email), **Listmonk** (self-hosted), or ConvertKit/Mailchimp. RSS-to-email means you may not need a form at all.
- **Comments** — if ever: **giscus** (GitHub Discussions; fits a dev audience, no DB, free) over Disqus.
- **Analytics** — privacy-friendly + static-friendly: **Plausible**, **Umami** (self-host), or **Netlify Analytics** (server-side, no script). Avoid GA for a craft blog.
- **View counts** — needs a tiny dynamic store (Netlify function + KV / Supabase / Turso). Only if you actually want the number; it breaks the "pure static" simplicity, so weigh it.

---

## 9. Authoring quality-of-life & CI

- **`pnpm new-post` scaffolder** — a script that prompts title/category and writes a dated stub with valid frontmatter. Removes the only friction in Tier 0.
- **CI on PR** — run `pnpm check` + `pnpm build` + a **link checker** + optional spell-check (`cspell`) on every push. Drafting in a branch then gives you a Netlify deploy-preview URL per post — effectively "staging for writing."
- **Prettier + markdownlint** — keep prose/files consistent.

---

## 10. Suggested roadmap (incremental, each step shippable)

- **Phase 1 — Foundation.** ✅ Effect frontmatter validation · ✅ auto `readTime`. _Remaining:_ `sitemap.xml` + RSS autodiscovery · `<SEO>` component · `pnpm new-post`.
- **Phase 2 — Discoverability.** Tags + `/tags/[tag]` · OG images · Pagefind search (around 20–30 posts).
- **Phase 3 — Richness.** `enhanced-img` + build-time diagrams · code-block captions · series support.
- **Phase 4 — Reach (only if wanted).** Newsletter wiring · giscus comments · privacy analytics.
- **Phase 5 — Reassess sourcing.** Only if mobile/web editing friction is real: add **Sveltia/Decap** (Tier 1). Revisit Tier 2 only against a concrete new requirement.

Order is deliberate: lock the contract → help readers find things → make posts richer → grow audience → change _how_ content is sourced last, because that's the most disruptive and least necessary today.

---

## 11. Open decisions for you

1. **Sourcing ceiling** — happy committing Markdown indefinitely, or do you want a browser editor for writing away from your machine? (Determines whether Phase 5 ever happens.)
2. ~~**`readTime`** — auto-calculate or hand-set?~~ → **decided: auto-calculate** (optional override kept).
3. **Taxonomy** — single `category` only, or add `tags` + a pinned category list?
4. **Newsletter & comments** — in scope at all? If yes, Buttondown + giscus are the low-friction picks.
5. **View counts / analytics** — worth introducing a small dynamic dependency, or stay strictly static?

My default if you say nothing: do **Phase 1** as-is (it's pure upside and changes no decisions), and leave 3–5 until you've published a handful more posts and can see what you actually reach for.
