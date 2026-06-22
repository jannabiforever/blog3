<script lang="ts">
  import { resolve } from "$app/paths";
  import type { PostMeta } from "$lib/types";

  /** Previous / next pager. Either side may be null (no wrap-around). */
  let { prev, next }: { prev: PostMeta | null; next: PostMeta | null } = $props();
</script>

<nav class="pager">
  {#if prev}
    <a class="cell" href={resolve("/posts/[slug]", { slug: prev.slug })}>
      <div class="dir">&larr; Previous</div>
      <div class="title">{prev.title}</div>
    </a>
  {:else}
    <span></span>
  {/if}
  {#if next}
    <a class="cell right" href={resolve("/posts/[slug]", { slug: next.slug })}>
      <div class="dir">Next &rarr;</div>
      <div class="title">{next.title}</div>
    </a>
  {:else}
    <span></span>
  {/if}
</nav>

<style>
  .pager {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 32px 0 80px;
    border-top: 1px solid var(--hair);
  }
  .cell {
    text-decoration: none;
    color: inherit;
  }
  .cell.right {
    text-align: right;
  }
  .dir {
    margin-bottom: 8px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--faint-2);
  }
  .title {
    font-family: var(--serif);
    font-size: 18px;
    font-weight: 500;
    line-height: 1.3;
    color: var(--ink);
  }
  .cell:hover .title {
    color: var(--accent);
  }
</style>
