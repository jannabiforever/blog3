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

<main class="wrap wide">
  <section class="hero">
    <Eyebrow tone="meta" tracking="0.18em" mb={30}>
      {site.tagline} &nbsp;·&nbsp; {data.posts.length} essays
    </Eyebrow>
    <h1>{site.heroTitle}</h1>
    <div class="rule"></div>
    <p class="dek">{site.heroSub}</p>
  </section>

  {#if featured}
    <section class="featured-sec">
      <Eyebrow tone="section" tracking="0.16em">Featured</Eyebrow>
      <FeaturedPost post={featured} />
    </section>
  {/if}

  <section class="latest">
    <Eyebrow tone="section" tracking="0.16em" mb={6}>Latest</Eyebrow>
    {#each rest as post (post.slug)}
      <PostRow {post} />
    {/each}
  </section>
</main>

<style>
  .hero {
    padding: 64px 0 44px;
    text-align: center;
    animation: fadeUp 0.5s ease both;
  }
  .hero h1 {
    margin: 0 auto;
    max-width: 720px;
    font-family: var(--serif);
    font-size: 38px;
    line-height: 1.18;
    font-weight: 500;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }
  .rule {
    width: 54px;
    height: 1px;
    margin: 34px auto 0;
    background: var(--rule);
  }
  .dek {
    margin: 30px auto 0;
    max-width: 520px;
    font-family: var(--serif);
    font-style: italic;
    font-size: 17px;
    line-height: 1.55;
    color: var(--text-2b);
  }
  .featured-sec {
    padding: 28px 0 0;
    border-top: 1px solid var(--hair);
    border-bottom: 1px solid var(--hair);
  }
  .latest {
    padding: 40px 0 100px;
  }
  @media (max-width: 720px) {
    .hero {
      padding: 44px 0 32px;
    }
    .hero h1 {
      font-size: 30px;
    }
  }
</style>
