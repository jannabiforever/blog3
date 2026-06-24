<script lang="ts">
  import { onMount } from "svelte";
  import Eyebrow from "$lib/components/Eyebrow.svelte";
  import Figure from "$lib/components/Figure.svelte";

  // All portraits in the assets folder, optimized at build time by
  // @sveltejs/enhanced-img (avif/webp + responsive sizes). Drop more files in
  // to extend the rotation; with none present the placeholder below shows.
  const portraitModules = import.meta.glob<{ default: string }>(
    "/src/lib/assets/portraits/*.{avif,gif,heic,heif,jpeg,jpg,png,tiff,webp,AVIF,GIF,HEIC,HEIF,JPEG,JPG,PNG,TIFF,WEBP}",
    { eager: true, query: { enhanced: true } },
  );
  const portraits = Object.values(portraitModules).map((m) => m.default);

  // Cycle through them across visits SSR renders the first, then on
  // mount we show the stored index and advance it so the next load steps on.
  // onMount (not $effect) so it runs exactly once per visit — no double-step.
  let index = $state(0);
  onMount(() => {
    if (portraits.length <= 1) return;
    const n = portraits.length;
    const stored = Number(localStorage.getItem("about:portrait"));
    const start = Number.isInteger(stored) ? ((stored % n) + n) % n : 0;
    index = start;
    localStorage.setItem("about:portrait", String((start + 1) % n));
  });
</script>

<svelte:head>
  <title>About · yujungin.com</title>
  <meta
    name="description"
    content="A few things about Jungin — math teacher, builder, and keeper of an open notebook."
  />
</svelte:head>

<main class="wrap max-w-180 font-serif text-[18px] leading-[1.7] text-body">
  <!-- Section 1 — Intro -->
  <section class="animate-fade-up pt-18">
    <Eyebrow tone="meta" tracking="0.18em" mb={26}>About</Eyebrow>

    <div class="grid grid-cols-1 items-start gap-11 min-[640px]:grid-cols-[1fr_168px]">
      <div>
        <h1
          class="m-0 text-[38px] leading-[1.16] font-medium tracking-[-0.02em] text-balance text-ink"
        >
          A few things about me, in no particular order.
        </h1>
        <p class="mt-6.5 text-[18px] leading-[1.55] text-secondary-2 italic">Jungin, 2003.</p>
      </div>

      <div class="w-42">
        {#if portraits.length}
          <enhanced:img
            src={portraits[index]}
            alt="Jungin"
            class="block aspect-3/4 w-full rounded-sm border border-fig-border object-cover"
          />
        {:else}
          <Figure ratio="3/4" caption="portrait" />
        {/if}
      </div>
    </div>

    <div class="mt-10.5 h-px w-13.5 bg-rule"></div>
  </section>

  <!-- Section 2 — Background -->
  <section class="pt-10">
    <p class="m-0 mb-6">
      I studied a fair bit of physics and math before this. I liked it more than I expected to, and
      at some point it just stuck. I didn't end up doing it for a living, which is fine — I still
      read a paper here and there to keep the door open.
    </p>
    <p class="m-0 mb-6">
      What carried over wasn't really the math. It was more a habit of looking for the shape of a
      thing before the details. I notice when two unrelated problems turn out to be the same
      underneath. It's handy with code, most of the time.
    </p>
    <p class="m-0">
      That's about it for the background. I tend to think in terms of structure first, and fill in
      the specifics later.
    </p>
  </section>

  <!-- Section 3 — Why I write here -->
  <section class="pt-12">
    <Eyebrow tone="section" tracking="0.16em" mb={18}>Why I write here</Eyebrow>
    <p class="m-0 mb-6">
      I work mostly on my own, so writing is a way of checking my own thinking. If an idea still
      makes sense once it's written down, it was probably worth keeping. If it doesn't, that's good
      to know too.
    </p>
    <p class="m-0">
      None of it is meant as advice. It's just a notebook I keep in the open, and sometimes I get
      things wrong.
    </p>
  </section>

  <!-- Section 4 — Off the clock -->
  <section class="pt-12 pb-25">
    <div class="flex flex-wrap gap-2.5">
      {#each ["Chess", "Brazilian jiu-jitsu", "Piano", "Lifting"] as chip (chip)}
        <span
          class="rounded-full border border-avatar-border bg-surface px-3.25 py-1.75 font-mono text-[11px] tracking-[0.04em] text-secondary-3"
        >
          {chip}
        </span>
      {/each}
    </div>
  </section>
</main>
