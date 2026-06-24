import { defineMDSveXConfig as defineConfig, escapeSvelte } from "mdsvex";
import { createHighlighter } from "shiki";
import { visit, SKIP } from "unist-util-visit";
import katex from "katex";

/**
 * Code highlighting uses Shiki's `one-dark-pro` — the closest bundled
 * approximation of Zed's "One Dark" theme (the zed.dev/blog reference).
 * Container styling (padding / radius / font) lives in Prose.svelte; the
 * block's background and token colors come from the theme's inline styles.
 */
const CODE_THEME = "one-dark-pro";

/**
 * Copy button, baked into the highlighted HTML at build time (Shiki's
 * recommended approach — the button ships in the static markup rather than
 * being assembled by client-side DOM surgery). Prose.svelte only attaches a
 * single delegated click handler to drive the clipboard write.
 *
 * Icons are inlined SVG (viewBox 0 0 24 24, currentColor) so CSS owns the
 * color/state; the `.code-block` wrapper is the positioning context that keeps
 * the button pinned outside the <pre>'s horizontal scroll area.
 */
const COPY_ICON = `<svg class="i-copy" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg class="i-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
const COPY_BUTTON = `<button type="button" class="code-copy" title="Copy" aria-label="Copy code">${COPY_ICON}${CHECK_ICON}</button>`;

const LANGS = [
  "rust",
  "typescript",
  "javascript",
  "bash",
  "python",
  "toml",
  "sql",
  "c",
  "go",
  "json",
  "jsonc",
  "yaml",
  "css",
  "html",
  "svelte",
  "diff",
];

let highlighterPromise;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [CODE_THEME],
      langs: LANGS,
    });
  }
  return highlighterPromise;
}

/**
 * Math support.
 *
 * mdsvex 0.12 bundles the legacy (pre-micromark) remark parser, so
 * remark-math's micromark extension never fires. Instead we render math at
 * the rehype (HAST) stage — which DOES run — straight through KaTeX:
 *   - `$$ … $$`  → display math
 *   - `$ … $`    → inline math
 * `{` / `}` in KaTeX output (and its MathML TeX annotation) are turned into
 * HTML entities so Svelte doesn't read them as expression delimiters.
 */
const MATH = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

function escapeBraces(html) {
  return html.replace(/{/g, "&#123;").replace(/}/g, "&#125;");
}

function rehypeKatex() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (parent.type === "element" && (parent.tagName === "code" || parent.tagName === "pre"))
        return;
      const value = node.value;
      if (!value.includes("$")) return;

      const out = [];
      let last = 0;
      let match;
      MATH.lastIndex = 0;
      while ((match = MATH.exec(value))) {
        if (match.index > last) out.push({ type: "text", value: value.slice(last, match.index) });
        const display = match[1] != null;
        const tex = (match[1] ?? match[2]).trim();
        const html = katex.renderToString(tex, {
          displayMode: display,
          throwOnError: false,
        });
        out.push({ type: "raw", value: escapeBraces(html) });
        last = MATH.lastIndex;
      }
      if (out.length === 0) return;
      if (last < value.length) out.push({ type: "text", value: value.slice(last) });

      parent.children.splice(index, 1, ...out);
      return [SKIP, index + out.length];
    });
  };
}

/** @type {import('mdsvex').MdsvexOptions} */
const config = defineConfig({
  extensions: [".md"],
  highlight: {
    highlighter: async (code, lang = "text") => {
      const hl = await getHighlighter();
      const language = hl.getLoadedLanguages().includes(lang) ? lang : "text";
      const html = hl.codeToHtml(code, {
        lang: language,
        theme: CODE_THEME,
      });
      const block = `<div class="code-block">${html}${COPY_BUTTON}</div>`;
      return `{@html \`${escapeSvelte(block)}\`}`;
    },
  },
  rehypePlugins: [rehypeKatex],
});

export default config;
