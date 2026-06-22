<script lang="ts">
  /**
   * Article / featured figure. With no `src` it renders the design's
   * diagonal-striped placeholder; pass `src` once real artwork exists.
   */
  let {
    ratio = "16/9",
    caption = "",
    src = "",
    alt = "",
    mb = 0,
  }: {
    ratio?: string;
    caption?: string;
    src?: string;
    alt?: string;
    mb?: number;
  } = $props();
</script>

<figure style="margin-bottom: {mb}px;">
  {#if src}
    <img
      {src}
      {alt}
      class="block w-full rounded-[4px] border border-fig-border object-cover"
      style="aspect-ratio: {ratio};"
    />
  {:else}
    <div
      class="fig-stripes flex items-end rounded-[4px] border border-fig-border p-4"
      style="aspect-ratio: {ratio};"
    >
      {#if caption}
        <span class="rounded-[3px] bg-bg/90 px-2 py-1 font-mono text-[11px] text-faint-2">
          {caption}
        </span>
      {/if}
    </div>
  {/if}
  {#if src && caption}
    <figcaption class="mt-[11px] text-center font-mono text-[11px] text-faint-2">
      {caption}
    </figcaption>
  {/if}
</figure>
