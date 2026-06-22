<script lang="ts">
	import { site } from '$lib/config';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
</script>

<svelte:head>
	<title>Subscribe · jungin.dev</title>
	<meta name="description" content="Subscribe to new essays." />
</svelte:head>

<main class="wrap read subscribe">
	<Eyebrow tone="accent" tracking="0.12em" mb={20}>Subscribe</Eyebrow>
	<h1>Get new essays in your reader or inbox.</h1>
	<p class="dek">
		The newsletter form isn’t wired up yet. For now, follow along over
		<a href={site.social.rss}>RSS</a>.
	</p>

	<form
		class="form"
		onsubmit={(e) => {
			e.preventDefault();
		}}
	>
		<input type="email" placeholder="you@example.com" aria-label="Email address" />
		<button type="submit">Notify me</button>
	</form>
	<p class="note">Hook this up to a provider (Buttondown, Listmonk, ConvertKit…) — see CONTENT.md.</p>
</main>

<style>
	.subscribe {
		padding: 80px 0 100px;
		text-align: center;
	}
	h1 {
		margin: 0 auto;
		max-width: 520px;
		font-family: var(--serif);
		font-size: 30px;
		line-height: 1.2;
		font-weight: 500;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}
	.dek {
		margin: 22px auto 32px;
		max-width: 440px;
		font-family: var(--serif);
		font-style: italic;
		font-size: 17px;
		line-height: 1.55;
		color: var(--text-2b);
	}
	.dek a {
		color: var(--accent);
	}
	.form {
		display: flex;
		gap: 10px;
		justify-content: center;
		max-width: 420px;
		margin: 0 auto;
	}
	input {
		flex: 1;
		font-family: var(--sans);
		font-size: 14px;
		padding: 10px 14px;
		border: 1px solid var(--subscribe-border);
		border-radius: 999px;
		background: var(--surface);
		color: var(--ink);
	}
	input:focus {
		outline: none;
		border-color: var(--accent);
	}
	button {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--surface);
		background: var(--accent);
		border: none;
		padding: 10px 18px;
		border-radius: 999px;
		cursor: pointer;
	}
	.note {
		margin-top: 22px;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--muted-3);
	}
</style>
