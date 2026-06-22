<script lang="ts">
  import Eyebrow from "$lib/components/Eyebrow.svelte";
  import ArchiveRow from "$lib/components/ArchiveRow.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Archive · jungin.dev</title>
  <meta name="description" content="Everything published, in reverse order of obsession." />
</svelte:head>

<main class="wrap mid">
  <section class="head">
    <Eyebrow tone="meta" tracking="0.18em" mb={22}>
      {data.count} entries · {data.groups[0]?.year ?? ""}
    </Eyebrow>
    <h1>The Archive</h1>
    <p class="dek">Everything published, in reverse order of obsession.</p>
  </section>

  <section class="list">
    {#each data.groups as group (group.year)}
      <div class="year"><span>{group.year}</span></div>
      {#each group.items as post (post.slug)}
        <ArchiveRow {post} />
      {/each}
    {/each}
  </section>
</main>

<style>
  .head {
    padding: 80px 0 36px;
    text-align: center;
    animation: fadeUp 0.5s ease both;
  }
  .head h1 {
    margin: 0;
    font-family: var(--serif);
    font-size: 32px;
    line-height: 1.15;
    font-weight: 500;
    letter-spacing: -0.02em;
  }
  .dek {
    margin: 20px auto 0;
    font-family: var(--serif);
    font-style: italic;
    font-size: 18px;
    color: var(--text-2b);
  }
  .list {
    padding: 8px 0 100px;
  }
  .year {
    display: flex;
    align-items: baseline;
    gap: 14px;
    padding: 34px 0 6px;
    border-top: 1px solid var(--hair);
  }
  .year span {
    font-family: var(--serif);
    font-size: 30px;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: var(--rule);
  }
  @media (max-width: 720px) {
    .head {
      padding: 52px 0 28px;
    }
  }
</style>
