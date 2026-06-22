<script lang="ts">
  import type { PostMeta } from "$lib/types";
  import { resolve } from "$app/paths";
  import { shortDate } from "$lib/utils/date";
  import Eyebrow from "./Eyebrow.svelte";

  let { post }: { post: PostMeta } = $props();
</script>

<a
  href={resolve("/posts/[slug]", { slug: post.slug })}
  class="-mx-4 grid grid-cols-[96px_1fr] gap-8 rounded-md border-b border-hair-list px-4 py-7.5 text-inherit transition-colors hover:bg-surface max-[560px]:grid-cols-1 max-[560px]:gap-2.5"
>
  <div
    class="pt-1.5 font-mono text-[11px] leading-[1.6] text-faint-2 max-[560px]:flex max-[560px]:gap-2.5 max-[560px]:pt-0"
  >
    <div>{shortDate(post.date)}</div>
    <div class="text-rule">{post.readTime}</div>
  </div>
  <div class="max-w-160">
    <Eyebrow tone="accent" tracking="0.08em" mb={9}>{post.category}</Eyebrow>
    <h3 class="mb-2 font-serif text-[20px] font-medium leading-[1.3] tracking-[-0.01em] text-ink">
      {post.title}
    </h3>
    <p class="text-[14px] leading-[1.55] text-secondary-3">{post.excerpt}</p>
  </div>
</a>
