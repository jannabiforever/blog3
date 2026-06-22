<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Wraps compiled markdown and applies the editorial reading styles.
	 * Because the body HTML comes from mdsvex (outside Svelte's scoping),
	 * every rule targets it through `:global()`.
	 */
	let { children }: { children: Snippet } = $props();
</script>

<div class="prose">
	{@render children()}
</div>

<style>
	.prose {
		font-family: var(--serif);
		font-size: 17px;
		color: var(--prose);
		line-height: var(--prose-leading);
		letter-spacing: var(--prose-tracking);
	}

	.prose :global(p) {
		margin: 0 0 22px;
	}

	/* Floated drop-cap on the opening paragraph only (not nested <p>, e.g. in blockquotes) */
	.prose > :global(p:first-of-type)::first-letter {
		float: left;
		font-size: 46px;
		line-height: 0.82;
		font-weight: 500;
		padding: 6px 12px 0 0;
		color: var(--ink);
	}

	.prose :global(h2) {
		margin: 38px 0 14px;
		font-family: var(--serif);
		font-size: 21px;
		font-weight: 600;
		line-height: 1.25;
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.prose :global(h3) {
		margin: 30px 0 12px;
		font-family: var(--serif);
		font-size: 18px;
		font-weight: 600;
		color: var(--ink);
	}

	.prose :global(a) {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-thickness: 1px;
	}
	.prose :global(strong) {
		font-weight: 600;
		color: var(--ink);
	}
	.prose :global(em) {
		font-style: italic;
	}

	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 22px;
		padding-left: 1.4em;
	}
	.prose :global(li) {
		margin: 0 0 8px;
	}

	/* Inline code */
	.prose :global(code) {
		font-family: var(--mono);
		font-size: 14px;
		background: var(--inline-code-bg);
		padding: 1px 6px;
		border-radius: 5px;
	}

	/* Code block (shiki output) */
	.prose :global(pre) {
		margin: 0 0 24px;
		padding: var(--code-pad);
		border-radius: var(--code-radius);
		background: var(--code-bg) !important;
		color: var(--code-fg);
		font-family: var(--mono);
		font-size: 13.5px;
		line-height: var(--prose-leading);
		overflow-x: auto;
	}
	.prose :global(pre code) {
		padding: 0;
		background: none;
		border-radius: 0;
		font-size: inherit;
	}

	.prose :global(figure) {
		margin: 0 0 32px;
	}
	.prose :global(figure pre) {
		margin: 0;
	}
	.prose :global(figcaption) {
		margin-top: 11px;
		text-align: center;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--faint-2);
	}

	/* Centered pull quote */
	.prose :global(blockquote) {
		margin: 36px 0;
		padding: 0 24px;
		text-align: center;
		font-family: var(--serif);
		font-style: italic;
		font-size: 21px;
		line-height: 1.45;
		font-weight: 500;
		color: #202734;
	}
	.prose :global(blockquote p) {
		margin: 0;
	}

	.prose :global(hr) {
		margin: 40px 0;
		border: none;
		border-top: 1px solid var(--hair);
	}

	.prose :global(img) {
		max-width: 100%;
		border-radius: 4px;
		border: 1px solid var(--fig-border);
	}

	/* KaTeX display math */
	.prose :global(.katex-display) {
		margin: 28px 0;
		overflow-x: auto;
		overflow-y: hidden;
	}
</style>
