<script lang="ts">
  import { author } from "$lib/config";
  import { resolve } from "$app/paths";
  import Eyebrow from "$lib/components/Eyebrow.svelte";
  import Byline from "$lib/components/Byline.svelte";
  import Figure from "$lib/components/Figure.svelte";
  import Prose from "$lib/components/Prose.svelte";
  import PostNav from "$lib/components/PostNav.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const Content = $derived(data.content);
  const meta = $derived(data.meta);
</script>

<svelte:head>
  <title>{meta.title} · yujungin.com</title>
  <meta name="description" content={meta.excerpt} />
</svelte:head>

<main class="wrap max-w-170">
  <div class="pt-9">
    <a href={resolve("/")} class="font-mono text-[11px] uppercase tracking-[0.06em] text-accent">
      &larr; Writing
    </a>
  </div>

  {#key meta.slug}
    <article class="animate-fade-up pt-10 pb-15">
      <header class="mb-[34px] border-b border-hair pb-[30px] text-center">
        <Eyebrow tone="accent" tracking="0.12em" mb={20}>{meta.category}</Eyebrow>
        <h1
          class="mx-auto font-serif text-[30px] leading-[1.2] font-medium tracking-[-0.02em] text-balance max-[720px]:text-[26px]"
        >
          {meta.title}
        </h1>
        <p
          class="mx-auto mt-[22px] mb-[30px] max-w-[520px] font-serif text-[17px] leading-[1.55] text-secondary-2 italic"
        >
          {meta.excerpt}
        </p>
        <Byline
          name={author.name}
          initials={author.initials}
          date={meta.date}
          readTime={meta.readTime}
          suffix="read"
          align="center"
        />
      </header>

      {#if meta.cover !== false}
        <Figure ratio="16/9" caption={meta.coverCaption ?? ""} mb={36} />
      {/if}

      <Prose>
        <Content />
      </Prose>
    </article>
  {/key}

  <PostNav prev={data.prev} next={data.next} />
</main>
