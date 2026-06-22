<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Mono uppercase micro-label used for category tags and section headers.
	 * `tone` picks the color ramp; `tracking` / `mb` vary per placement.
	 */
	let {
		tone = 'section',
		tracking = '0.1em',
		mb = 0,
		children
	}: {
		tone?: 'accent' | 'section' | 'meta';
		tracking?: string;
		mb?: number;
		children: Snippet;
	} = $props();
</script>

<span class="eyebrow {tone}" style="letter-spacing: {tracking}; margin-bottom: {mb}px;">
	{@render children()}
</span>

<style>
	.eyebrow {
		display: block;
		font-family: var(--mono);
		font-size: 11px;
		font-weight: 400;
		text-transform: uppercase;
	}
	.accent {
		color: var(--accent);
	}
	.section {
		color: var(--faint-3);
	}
	.meta {
		color: var(--muted-3);
	}
</style>
