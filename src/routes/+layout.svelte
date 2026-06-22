<script lang="ts">
	import '../app.css';
	import 'katex/dist/katex.min.css';
	import type { Snippet } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="shell">
	<Header />
	<div class="grow">
		{@render children()}
	</div>
	<Footer />
</div>

<style>
	.shell {
		display: flex;
		min-height: 100vh;
		flex-direction: column;
	}
	.grow {
		flex: 1;
	}
</style>
