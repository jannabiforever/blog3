<script lang="ts">
  import type { PostMeta } from "$lib/types";
  import { resolve } from "$app/paths";
  import { shortDate } from "$lib/utils/date";
  import Eyebrow from "./Eyebrow.svelte";

  let { post }: { post: PostMeta } = $props();
</script>

<a
  href={resolve("/posts/[slug]", { slug: post.slug })}
  class="-mx-4 grid grid-cols-[1fr_auto] items-baseline gap-6 rounded-md border-b border-hair-archive px-4 py-4.5 text-inherit transition-colors hover:bg-surface"
>
  <div class="min-w-0">
    <h3 class="mb-1 font-serif text-[17px] font-medium leading-[1.35] tracking-[-0.01em] text-ink">
      {post.title}
    </h3>
    <Eyebrow tone="accent" tracking="0.06em">{post.category}</Eyebrow>
  </div>
  <div class="flex-none text-right font-mono text-[11px] whitespace-nowrap text-faint-2">
    {shortDate(post.date)} · {post.readTime}
  </div>
</a>
