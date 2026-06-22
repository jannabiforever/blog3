<script lang="ts">
	import { author } from '$lib/config';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import Prose from '$lib/components/Prose.svelte';
</script>

<svelte:head>
	<title>About · jungin.dev</title>
	<meta name="description" content="About {author.name}." />
</svelte:head>

<main class="wrap read about">
	<header>
		<Eyebrow tone="accent" tracking="0.12em" mb={20}>About</Eyebrow>
		<h1>{author.name}</h1>
		<p class="dek">{author.role} — writing about the parts that don’t fit in a commit message.</p>
	</header>

	<Prose>
		<p>
			This is a placeholder about page. Replace it with a short bio, what you work on, and how to
			get in touch. Because it renders through the same <code>Prose</code> styles as every essay, it
			can be moved into markdown later without losing its look.
		</p>
	</Prose>
</main>

<style>
	.about {
		padding-bottom: 80px;
	}
	header {
		text-align: center;
		padding: 60px 0 30px;
		margin-bottom: 34px;
		border-bottom: 1px solid var(--hair);
	}
	h1 {
		margin: 0;
		font-family: var(--serif);
		font-size: 30px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.dek {
		margin: 20px auto 0;
		max-width: 520px;
		font-family: var(--serif);
		font-style: italic;
		font-size: 17px;
		line-height: 1.55;
		color: var(--text-2b);
	}
</style>
