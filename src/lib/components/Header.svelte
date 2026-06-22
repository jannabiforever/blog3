<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";

  const path = $derived(page.url.pathname);
  const isHome = $derived(path === "/");
  const isArchive = $derived(path.startsWith("/archive"));
  const isAbout = $derived(path.startsWith("/about"));

  const nav =
    "px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors hover:text-ink max-[560px]:px-[7px]";
</script>

<header
  class="sticky top-0 z-20 border-b border-hair bg-bg/85 backdrop-blur-[10px] backdrop-saturate-[1.6]"
>
  <div class="wrap flex h-[62px] max-w-[70rem] items-center justify-between">
    <a
      href={resolve("/")}
      aria-label="jungin.dev home"
      class="font-serif text-[21px] font-medium tracking-[-0.01em] text-ink"
    >
      jungin<span class="text-accent">.dev</span>
    </a>
    <nav class="flex items-center gap-1">
      <a href={resolve("/")} class="{nav} {isHome ? 'text-ink' : 'text-muted'}">Writing</a>
      <a href={resolve("/archive")} class="{nav} {isArchive ? 'text-ink' : 'text-muted'}">Archive</a
      >
      <a href={resolve("/about")} class="{nav} {isAbout ? 'text-ink' : 'text-muted'}">About</a>
      <a
        href={resolve("/subscribe")}
        class="ml-2 rounded-full border border-subscribe-border bg-surface px-[13px] py-[7px] font-mono text-[11px] uppercase tracking-[0.08em] text-ink max-[560px]:hidden"
      >
        Subscribe
      </a>
    </nav>
  </div>
</header>
