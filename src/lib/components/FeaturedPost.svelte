<script lang="ts">
	import type { PostMeta } from '$lib/types';
	import { author } from '$lib/config';
	import Eyebrow from './Eyebrow.svelte';
	import Byline from './Byline.svelte';
	import Figure from './Figure.svelte';

	let { post }: { post: PostMeta } = $props();
</script>

<a class="featured" href="/posts/{post.slug}">
	<div class="text">
		<Eyebrow tone="accent" tracking="0.1em" mb={18}>{post.category}</Eyebrow>
		<h2>{post.title}</h2>
		<p class="excerpt">{post.excerpt}</p>
		<Byline name={author.name} initials={author.initials} date={post.date} readTime={post.readTime} />
	</div>
	<Figure ratio="4/3" caption={post.coverCaption ?? 'figure'} />
</a>

<style>
	.featured {
		display: grid;
		grid-template-columns: 1fr 0.82fr;
		gap: 52px;
		align-items: center;
		padding: 24px 0 44px;
		text-decoration: none;
		color: inherit;
	}
	h2 {
		margin: 0 0 18px;
		font-family: var(--serif);
		font-size: 27px;
		line-height: 1.22;
		font-weight: 500;
		letter-spacing: -0.015em;
		text-wrap: balance;
		color: var(--ink);
	}
	.excerpt {
		margin: 0 0 22px;
		max-width: 460px;
		font-size: 15px;
		line-height: 1.6;
		color: var(--text-2);
	}
	@media (max-width: 720px) {
		.featured {
			grid-template-columns: 1fr;
			gap: 28px;
			padding: 20px 0 36px;
		}
	}
</style>
