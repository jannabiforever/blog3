<script lang="ts">
  import { site } from "$lib/config";
  import Eyebrow from "$lib/components/Eyebrow.svelte";
</script>

<svelte:head>
  <title>Subscribe · yujungin.com</title>
  <meta name="description" content="Subscribe to new essays." />
</svelte:head>

<main class="wrap max-w-170 pt-20 pb-25 text-center">
  <Eyebrow tone="accent" tracking="0.12em" mb={20}>Subscribe</Eyebrow>
  <h1
    class="mx-auto max-w-130 font-serif text-[30px] leading-[1.2] font-medium tracking-[-0.02em] text-balance"
  >
    Get new essays in your reader or inbox.
  </h1>
  <p
    class="mx-auto mt-5.5 mb-8 max-w-110 font-serif text-[17px] leading-[1.55] text-secondary-2 italic"
  >
    The newsletter form isn’t wired up yet. For now, follow along over
    <a href={site.social.rss} rel="external" class="text-accent">RSS</a>.
  </p>

  <form
    class="mx-auto flex max-w-105 justify-center gap-2.5"
    onsubmit={(e) => {
      e.preventDefault();
    }}
  >
    <input
      type="email"
      placeholder="you@example.com"
      aria-label="Email address"
      class="flex-1 rounded-full border border-subscribe-border bg-surface px-3.5 py-2.5 font-sans text-[14px] text-ink focus:border-accent focus:outline-none"
    />
    <button
      type="submit"
      class="cursor-pointer rounded-full border-none bg-accent px-4.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-surface"
    >
      Notify me
    </button>
  </form>
</main>
