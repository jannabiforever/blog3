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
      return `{@html \`${escapeSvelte(html)}\`}`;
    },
  },
  rehypePlugins: [rehypeKatex],
});

export default config;
