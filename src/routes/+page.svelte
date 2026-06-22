<script lang="ts">
  import { site } from "$lib/config";
  import Eyebrow from "$lib/components/Eyebrow.svelte";
  import FeaturedPost from "$lib/components/FeaturedPost.svelte";
  import PostRow from "$lib/components/PostRow.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const featured = $derived(data.posts.find((p) => p.featured) ?? data.posts[0]);
  const rest = $derived(data.posts.filter((p) => p.slug !== featured?.slug));
</script>

<svelte:head>
  <title>{site.title}</title>
  <meta name="description" content={site.description} />
</svelte:head>

<main class="wrap max-w-280">
  <section class="animate-fade-up pt-16 pb-11 text-center max-[720px]:pt-11 max-[720px]:pb-8">
    <Eyebrow tone="meta" tracking="0.18em" mb={30}>
      {site.tagline} &nbsp;·&nbsp; {data.posts.length} essays
    </Eyebrow>
    <h1
      class="mx-auto max-w-180 font-serif text-[38px] leading-[1.18] font-medium tracking-[-0.02em] text-balance max-[720px]:text-[30px]"
    >
      {site.heroTitle}
    </h1>
    <div class="mx-auto mt-8.5 h-px w-13.5 bg-rule"></div>
    <p
      class="mx-auto mt-7.5 max-w-130 font-serif text-[17px] leading-[1.55] text-secondary-2 italic"
    >
      {site.heroSub}
    </p>
  </section>

  {#if featured}
    <section class="border-y border-hair pt-7">
      <Eyebrow tone="section" tracking="0.16em">Featured</Eyebrow>
      <FeaturedPost post={featured} />
    </section>
  {/if}

  <section class="pt-10 pb-25">
    <Eyebrow tone="section" tracking="0.16em" mb={6}>Latest</Eyebrow>
    {#each rest as post (post.slug)}
      <PostRow {post} />
    {/each}
  </section>
</main>
