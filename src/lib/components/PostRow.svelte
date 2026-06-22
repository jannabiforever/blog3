<script lang="ts">
	import type { PostMeta } from '$lib/types';
	import { shortDate } from '$lib/utils/date';
	import Eyebrow from './Eyebrow.svelte';

	let { post }: { post: PostMeta } = $props();
</script>

<a class="row" href="/posts/{post.slug}">
	<div class="when">
		<div>{shortDate(post.date)}</div>
		<div class="rt">{post.readTime}</div>
	</div>
	<div class="body">
		<Eyebrow tone="accent" tracking="0.08em" mb={9}>{post.category}</Eyebrow>
		<h3>{post.title}</h3>
		<p>{post.excerpt}</p>
	</div>
</a>

<style>
	.row {
		display: grid;
		grid-template-columns: 96px 1fr;
		gap: 32px;
		padding: 30px 16px;
		margin: 0 -16px;
		border-bottom: 1px solid var(--hair-list);
		border-radius: 6px;
		text-decoration: none;
		color: inherit;
		transition: background 0.15s ease;
	}
	.row:hover {
		background: var(--surface);
	}
	.when {
		padding-top: 6px;
		font-family: var(--mono);
		font-size: 11px;
		line-height: 1.6;
		color: var(--faint-2);
	}
	.rt {
		color: var(--rule);
	}
	.body {
		max-width: 640px;
	}
	h3 {
		margin: 0 0 8px;
		font-family: var(--serif);
		font-size: 20px;
		line-height: 1.3;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	p {
		margin: 0;
		font-size: 14px;
		line-height: 1.55;
		color: var(--text-2c);
	}
	@media (max-width: 560px) {
		.row {
			grid-template-columns: 1fr;
			gap: 10px;
		}
		.when {
			display: flex;
			gap: 10px;
			padding-top: 0;
		}
	}
</style>
