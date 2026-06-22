<script lang="ts">
  import Eyebrow from "$lib/components/Eyebrow.svelte";
  import Prose from "$lib/components/Prose.svelte";
</script>

<svelte:head>
  <title>About · yujungin.com</title>
  <meta name="description" content="About Yu Jungin." />
</svelte:head>

<main class="wrap max-w-170 pb-20">
  <header class="mb-8.5 border-b border-hair pt-15 pb-7.5 text-center">
    <Eyebrow tone="accent" tracking="0.12em" mb={20}>About</Eyebrow>
    <h1 class="font-serif text-[30px] font-medium tracking-[-0.02em]">Yu Jungin</h1>
  </header>

  <Prose>
    <p>
      This is a placeholder about page. Replace it with a short bio, what you work on, and how to
      get in touch. Because it renders through the same <code>Prose</code> styles as every essay, it can
      be moved into markdown later without losing its look.
    </p>
  </Prose>
</main>
