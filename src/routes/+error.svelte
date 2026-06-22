<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
</script>

<svelte:head>
  <title>{page.status} · jungin.dev</title>
</svelte:head>

<main class="wrap max-w-170 py-[120px] text-center">
  <div class="mb-[18px] font-mono text-[11px] uppercase tracking-[0.18em] text-muted-3">
    {page.status}
  </div>
  <h1 class="mb-7 font-serif text-[30px] font-medium tracking-[-0.02em]">
    {page.error?.message ?? "Something went wrong"}
  </h1>
  <p>
    <a href={resolve("/")} class="font-mono text-[11px] uppercase tracking-[0.06em] text-accent">
      &larr; Back to writing
    </a>
  </p>
</main>
