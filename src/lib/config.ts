/**
 * Site-wide configuration and author identity.
 * Everything the chrome (header/footer), masthead, and feeds need that
 * is NOT per-post lives here, so copy changes never require touching markup.
 */

export const site = {
  name: "yujungin.com",
  title: "yujungin.com",
  url: "https://www.yujungin.com",
  description:
    "A personal journal by Jungin on software, with frequent detours into math and physics.",
  tagline: "A journal on code, math & physics",
  heroTitle: "Notes on building software — with detours into the math and physics underneath.",
  heroSub:
    "Mostly engineering and systems, with the occasional derivation or physics problem that wouldn’t leave me alone.",
  nav: [
    { label: "Writing", href: "/" },
    { label: "Archive", href: "/archive" },
    { label: "About", href: "/about" },
  ],
  social: {
    github: "https://github.com/jannabiforever",
    rss: "/rss.xml",
    email: "mailto:jungini1226@gmail.com",
  },
} as const;

export const author = {
  name: "Jungin",
  role: "Systems engineer",
  initials: "JI",
} as const;
