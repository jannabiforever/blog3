<script lang="ts">
	import { site, author } from '$lib/config';
</script>

<footer>
	<div class="inner wrap wide">
		<div>
			<div class="wordmark">jungin<span class="dot">.dev</span></div>
			<p class="tagline">
				A personal journal by {author.name} on software, with frequent detours into math and physics.
			</p>
		</div>
		<nav class="links">
			<a href={site.social.github}>GitHub</a>
			<a href={site.social.rss}>RSS</a>
			<a href={site.social.email}>Email</a>
		</nav>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--hair);
		background: var(--surface);
	}
	.inner {
		padding-top: 48px;
		padding-bottom: 48px;
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 24px;
		align-items: end;
	}
	.wordmark {
		font-family: var(--serif);
		font-size: 19px;
		font-weight: 500;
		margin-bottom: 8px;
	}
	.dot {
		color: var(--accent);
	}
	.tagline {
		margin: 0;
		max-width: 340px;
		font-size: 13px;
		line-height: 1.6;
		color: var(--muted-3);
	}
	.links {
		display: flex;
		gap: 22px;
		font-family: var(--mono);
		font-size: 12px;
	}
	.links a {
		color: var(--text-2c);
		text-decoration: none;
	}
	.links a:hover {
		color: var(--ink);
	}
	@media (max-width: 560px) {
		.inner {
			grid-template-columns: 1fr;
			align-items: start;
		}
	}
</style>
