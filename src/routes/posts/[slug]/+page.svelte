<script lang="ts">
	import { author } from '$lib/config';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import Byline from '$lib/components/Byline.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import Prose from '$lib/components/Prose.svelte';
	import PostNav from '$lib/components/PostNav.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const Content = $derived(data.content);
	const meta = $derived(data.meta);
</script>

<svelte:head>
	<title>{meta.title} · jungin.dev</title>
	<meta name="description" content={meta.excerpt} />
</svelte:head>

<main class="wrap read">
	<div class="back">
		<a href="/">&larr; Writing</a>
	</div>

	{#key meta.slug}
		<article>
			<header>
				<Eyebrow tone="accent" tracking="0.12em" mb={20}>{meta.category}</Eyebrow>
				<h1>{meta.title}</h1>
				<p class="dek">{meta.excerpt}</p>
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
				<Figure ratio="16/9" caption={meta.coverCaption ?? ''} mb={36} />
			{/if}

			<Prose>
				<Content />
			</Prose>
		</article>
	{/key}

	<PostNav prev={data.prev} next={data.next} />
</main>

<style>
	.back {
		padding: 36px 0 0;
	}
	.back a {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent);
		text-decoration: none;
	}
	article {
		padding: 40px 0 60px;
		animation: fadeUp 0.5s ease both;
	}
	header {
		text-align: center;
		padding-bottom: 30px;
		margin-bottom: 34px;
		border-bottom: 1px solid var(--hair);
	}
	h1 {
		margin: 0 auto;
		font-family: var(--serif);
		font-size: 30px;
		line-height: 1.2;
		font-weight: 500;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}
	.dek {
		margin: 22px auto 30px;
		max-width: 520px;
		font-family: var(--serif);
		font-style: italic;
		font-size: 17px;
		line-height: 1.55;
		color: var(--text-2b);
	}
	@media (max-width: 720px) {
		h1 {
			font-size: 26px;
		}
	}
</style>
