<script lang="ts">
  import type { PostMeta } from "$lib/types";
  import { resolve } from "$app/paths";
  import { author } from "$lib/config";
  import Eyebrow from "./Eyebrow.svelte";
  import Byline from "./Byline.svelte";
  import Figure from "./Figure.svelte";

  let { post }: { post: PostMeta } = $props();
</script>

<a
  href={resolve("/posts/[slug]", { slug: post.slug })}
  class="grid grid-cols-[1fr_0.82fr] items-center gap-[52px] pt-6 pb-11 text-inherit max-[720px]:grid-cols-1 max-[720px]:gap-7 max-[720px]:pt-5 max-[720px]:pb-9"
>
  <div>
    <Eyebrow tone="accent" tracking="0.1em" mb={18}>{post.category}</Eyebrow>
    <h2
      class="mb-[18px] font-serif text-[27px] font-medium leading-[1.22] tracking-[-0.015em] text-balance text-ink"
    >
      {post.title}
    </h2>
    <p class="mb-[22px] max-w-[460px] text-[15px] leading-[1.6] text-secondary">{post.excerpt}</p>
    <Byline
      name={author.name}
      initials={author.initials}
      date={post.date}
      readTime={post.readTime}
    />
  </div>
  <Figure ratio="4/3" caption={post.coverCaption ?? "figure"} />
</a>
