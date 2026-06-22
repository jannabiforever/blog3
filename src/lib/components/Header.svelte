<script lang="ts">
	import { page } from '$app/state';

	const path = $derived(page.url.pathname);
	const isHome = $derived(path === '/');
	const isArchive = $derived(path.startsWith('/archive'));
	const isAbout = $derived(path.startsWith('/about'));
</script>

<header>
	<div class="bar wrap wide">
		<a class="logo" href="/" aria-label="jungin.dev home">jungin<span class="dot">.dev</span></a>
		<nav>
			<a class="nav-item" class:active={isHome} href="/">Writing</a>
			<a class="nav-item" class:active={isArchive} href="/archive">Archive</a>
			<a class="nav-item" class:active={isAbout} href="/about">About</a>
			<a class="subscribe" href="/subscribe">Subscribe</a>
		</nav>
	</div>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgba(248, 247, 252, 0.85);
		backdrop-filter: saturate(160%) blur(10px);
		border-bottom: 1px solid var(--hair);
	}
	.bar {
		height: 62px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.logo {
		font-family: var(--serif);
		font-size: 21px;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink);
		text-decoration: none;
	}
	.dot {
		color: var(--accent);
	}
	nav {
		display: flex;
		align-items: center;
		gap: 4px;
		font-family: var(--mono);
	}
	.nav-item {
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		padding: 8px 12px;
		text-decoration: none;
		transition: color 0.15s ease;
	}
	.nav-item:hover,
	.nav-item.active {
		color: var(--ink);
	}
	.subscribe {
		margin-left: 8px;
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
		border: 1px solid var(--subscribe-border);
		padding: 7px 13px;
		border-radius: 999px;
		background: var(--surface);
	}
	@media (max-width: 560px) {
		.nav-item {
			padding: 8px 7px;
		}
		.subscribe {
			display: none;
		}
	}
</style>
