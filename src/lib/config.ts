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
  tagline: "Super - Personal Blog",
  heroTitle: "Notes on whatever I'm thinking through.",
  heroSub: "Math, physics, neuroscience, software — wherever the curiosity goes.",
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
