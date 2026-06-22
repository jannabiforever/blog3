<script lang="ts">
  import { site } from "$lib/config";
  import Eyebrow from "$lib/components/Eyebrow.svelte";
</script>

<svelte:head>
  <title>Subscribe · jungin.dev</title>
  <meta name="description" content="Subscribe to new essays." />
</svelte:head>

<main class="wrap max-w-170 pt-20 pb-[100px] text-center">
  <Eyebrow tone="accent" tracking="0.12em" mb={20}>Subscribe</Eyebrow>
  <h1
    class="mx-auto max-w-[520px] font-serif text-[30px] leading-[1.2] font-medium tracking-[-0.02em] text-balance"
  >
    Get new essays in your reader or inbox.
  </h1>
  <p
    class="mx-auto mt-[22px] mb-8 max-w-[440px] font-serif text-[17px] leading-[1.55] text-secondary-2 italic"
  >
    The newsletter form isn’t wired up yet. For now, follow along over
    <a href={site.social.rss} rel="external" class="text-accent">RSS</a>.
  </p>

  <form
    class="mx-auto flex max-w-[420px] justify-center gap-[10px]"
    onsubmit={(e) => {
      e.preventDefault();
    }}
  >
    <input
      type="email"
      placeholder="you@example.com"
      aria-label="Email address"
      class="flex-1 rounded-full border border-subscribe-border bg-surface px-[14px] py-[10px] font-sans text-[14px] text-ink focus:border-accent focus:outline-none"
    />
    <button
      type="submit"
      class="cursor-pointer rounded-full border-none bg-accent px-[18px] py-[10px] font-mono text-[11px] uppercase tracking-[0.08em] text-surface"
    >
      Notify me
    </button>
  </form>
  <p class="mt-[22px] font-mono text-[11px] text-muted-3">
    Hook this up to a provider (Buttondown, Listmonk, ConvertKit…) — see CONTENT.md.
  </p>
</main>
