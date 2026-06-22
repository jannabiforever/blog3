<script lang="ts">
  import { resolve } from "$app/paths";
  import type { PostMeta } from "$lib/types";

  /** Previous / next pager. Either side may be null (no wrap-around). */
  let { prev, next }: { prev: PostMeta | null; next: PostMeta | null } = $props();

  const dir = "mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-faint-2";
  const title = "font-serif text-[18px] font-medium leading-[1.3] text-ink group-hover:text-accent";
</script>

<nav class="grid grid-cols-2 gap-4 border-t border-hair pt-8 pb-20">
  {#if prev}
    <a href={resolve("/posts/[slug]", { slug: prev.slug })} class="group text-inherit">
      <div class={dir}>&larr; Previous</div>
      <div class={title}>{prev.title}</div>
    </a>
  {:else}
    <span></span>
  {/if}
  {#if next}
    <a href={resolve("/posts/[slug]", { slug: next.slug })} class="group text-right text-inherit">
      <div class={dir}>Next &rarr;</div>
      <div class={title}>{next.title}</div>
    </a>
  {:else}
    <span></span>
  {/if}
</nav>
