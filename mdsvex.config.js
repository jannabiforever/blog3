import { defineMDSveXConfig as defineConfig, escapeSvelte } from "mdsvex";
import { createHighlighter } from "shiki";
import { visit, SKIP } from "unist-util-visit";
import katex from "katex";

/**
 * Dark code theme derived from the design handoff tokens:
 *   bg #12161d · text #e3e8f0 · keyword #7cc4fb · fn #a9b4f5 · comment #6b7585
 * The remaining scopes use muted blues/violets so syntax stays in the
 * cool, restrained palette rather than the usual rainbow.
 */
const codeTheme = {
  name: "jungin-dark",
  type: "dark",
  fg: "#e3e8f0",
  bg: "#12161d",
  settings: [
    { settings: { foreground: "#e3e8f0", background: "#12161d" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#6b7585", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator",
        "storage",
        "storage.type",
        "storage.modifier",
        "variable.language",
        "constant.language",
        "support.type.primitive",
      ],
      settings: { foreground: "#7cc4fb" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call",
        "meta.function-call.generic",
      ],
      settings: { foreground: "#a9b4f5" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.name.namespace",
        "support.type",
        "support.class",
      ],
      settings: { foreground: "#86b8f0" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "constant.character"],
      settings: { foreground: "#9bb4cf" },
    },
    {
      scope: ["constant.numeric", "constant.other", "constant.language.boolean"],
      settings: { foreground: "#c0a9f0" },
    },
    {
      scope: ["variable", "meta.definition.variable", "support.variable"],
      settings: { foreground: "#e3e8f0" },
    },
    {
      scope: ["punctuation", "meta.brace", "meta.delimiter"],
      settings: { foreground: "#aab3c0" },
    },
  ],
};

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
      themes: [codeTheme],
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
        theme: "jungin-dark",
      });
      return `{@html \`${escapeSvelte(html)}\`}`;
    },
  },
  rehypePlugins: [rehypeKatex],
});

export default config;
