<script lang="ts">
	/**
	 * Article / featured figure. With no `src` it renders the design's
	 * diagonal-striped placeholder; pass `src` once real artwork exists.
	 */
	let {
		ratio = '16/9',
		caption = '',
		src = '',
		alt = '',
		mb = 0
	}: {
		ratio?: string;
		caption?: string;
		src?: string;
		alt?: string;
		mb?: number;
	} = $props();
</script>

<figure class="fig" style="margin: 0 0 {mb}px;">
	{#if src}
		<img {src} {alt} style="aspect-ratio: {ratio};" />
	{:else}
		<div class="placeholder" style="aspect-ratio: {ratio};">
			{#if caption}<span class="chip">{caption}</span>{/if}
		</div>
	{/if}
	{#if src && caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	.fig {
		padding: 0;
	}
	.placeholder {
		display: flex;
		align-items: flex-end;
		padding: 16px;
		border: 1px solid var(--fig-border);
		border-radius: 4px;
		background-image: repeating-linear-gradient(
			135deg,
			var(--stripe-a) 0,
			var(--stripe-a) 12px,
			var(--stripe-b) 12px,
			var(--stripe-b) 24px
		);
	}
	.chip {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--faint-2);
		background: rgba(248, 247, 252, 0.9);
		padding: 4px 8px;
		border-radius: 3px;
	}
	img {
		display: block;
		width: 100%;
		object-fit: cover;
		border: 1px solid var(--fig-border);
		border-radius: 4px;
	}
	figcaption {
		margin-top: 11px;
		text-align: center;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--faint-2);
	}
</style>
