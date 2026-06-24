<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import { site } from "$lib/config";

  const path = $derived(page.url.pathname);
  const isHome = $derived(path === "/");
  const isArchive = $derived(path.startsWith("/archive"));
  const isAbout = $derived(path.startsWith("/about"));

  // Single flag gates the whole feature (see config.ts newsletter).
  const subscribeEnabled = site.newsletter.username.length > 0;

  const nav =
    "px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors hover:text-ink max-[560px]:px-1.75";
</script>

<header
  class="sticky top-0 z-20 border-b border-hair bg-bg/85 backdrop-blur-[10px] backdrop-saturate-[1.6]"
>
  <div class="wrap flex h-15.5 max-w-280 items-center justify-between">
    <a
      href={resolve("/")}
      aria-label="yujungin.com home"
      class="font-serif text-[21px] font-medium tracking-[-0.01em] text-ink"
    >
      yujungin<span class="text-accent">.com</span>
    </a>
    <nav class="flex items-center gap-1">
      <a href={resolve("/")} class="{nav} {isHome ? 'text-ink' : 'text-muted'}">Writing</a>
      <a href={resolve("/archive")} class="{nav} {isArchive ? 'text-ink' : 'text-muted'}">Archive</a
      >
      <a href={resolve("/about")} class="{nav} {isAbout ? 'text-ink' : 'text-muted'}">About</a>
      {#if subscribeEnabled}
        <a
          href={resolve("/subscribe")}
          class="ml-2 rounded-full border border-subscribe-border bg-surface px-3.25 py-1.75 font-mono text-[11px] uppercase tracking-[0.08em] text-ink max-[560px]:hidden"
        >
          Subscribe
        </a>
      {/if}
    </nav>
  </div>
</header>
