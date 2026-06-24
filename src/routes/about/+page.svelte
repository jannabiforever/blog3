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
          A few things about me
        </h1>
        <p class="mt-6.5 text-[16px] leading-[1.55] text-secondary-2 italic">Jungin, 2003.</p>
        <p class="mt-2 text-[16px] leading-[1.55] text-secondary-2 italic">
          Majoring in Physics and Astronomy at Seoul National University.
        </p>
        <p class="mt-2 text-[16px] leading-[1.55] text-secondary-2 italic">
          Graduated from Seoul Science High School in 2021 (31st class).
        </p>
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
  </section>

  <div class="mt-10.5 h-px w-13.5 bg-rule"></div>

  <section class="pt-10">
    <p class="m-0 mb-6">
      I've studied a fair bit of physics and math. In physics, I'm drawn to hep-th, especially
      particle physics, along with black hole thermodynamics and the information theory around it.
      On the math side, a little differential geometry and topology — and a touch of Morse theory.
    </p>
  </section>

  <section class="pt-4">
    <Eyebrow tone="section" tracking="0.16em" mb={18}>Extra stuff</Eyebrow>
    <p class="m-0 mb-6">
      These days I mostly play chess in my free time, and the piano now and then. Chopin is my
      favorite, with Rachmaninoff a close second.
    </p>
    <p class="m-0">
      I used to train Brazilian jiu-jitsu, but stopped after a few months. Maybe I'll come back to
      it someday.
    </p>
  </section>
</main>
