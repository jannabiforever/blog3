<script lang="ts">
  import Eyebrow from "$lib/components/Eyebrow.svelte";
  import ArchiveRow from "$lib/components/ArchiveRow.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Archive · yujungin.com</title>
  <meta name="description" content="Everything published, in reverse order of obsession." />
</svelte:head>

<main class="wrap max-w-220">
  <section class="animate-fade-up pt-20 pb-9 text-center max-[720px]:pt-[52px] max-[720px]:pb-7">
    <Eyebrow tone="meta" tracking="0.18em" mb={22}>
      {data.count} entries · {data.groups[0]?.year ?? ""}
    </Eyebrow>
    <h1 class="font-serif text-[32px] leading-[1.15] font-medium tracking-[-0.02em]">
      The Archive
    </h1>
    <p class="mx-auto mt-5 font-serif text-[18px] text-secondary-2 italic">
      Everything published, in reverse order of obsession.
    </p>
  </section>

  <section class="pt-2 pb-[100px]">
    {#each data.groups as group (group.year)}
      <div class="flex items-baseline gap-[14px] border-t border-hair pt-[34px] pb-[6px]">
        <span class="font-serif text-[30px] font-medium tracking-[-0.01em] text-rule">
          {group.year}
        </span>
      </div>
      {#each group.items as post (post.slug)}
        <ArchiveRow {post} />
      {/each}
    {/each}
  </section>
</main>
