<script lang="ts">
	import type { PostMeta } from '$lib/types';
	import { shortDate } from '$lib/utils/date';
	import Eyebrow from './Eyebrow.svelte';

	let { post }: { post: PostMeta } = $props();
</script>

<a class="row" href="/posts/{post.slug}">
	<div class="left">
		<h3>{post.title}</h3>
		<Eyebrow tone="accent" tracking="0.06em">{post.category}</Eyebrow>
	</div>
	<div class="right">{shortDate(post.date)} · {post.readTime}</div>
</a>

<style>
	.row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 24px;
		align-items: baseline;
		padding: 18px 16px;
		margin: 0 -16px;
		border-bottom: 1px solid var(--hair-archive);
		border-radius: 6px;
		text-decoration: none;
		color: inherit;
		transition: background 0.15s ease;
	}
	.row:hover {
		background: var(--surface);
	}
	.left {
		min-width: 0;
	}
	h3 {
		margin: 0 0 4px;
		font-family: var(--serif);
		font-size: 17px;
		line-height: 1.35;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.right {
		flex: none;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--faint-2);
		white-space: nowrap;
		text-align: right;
	}
</style>
