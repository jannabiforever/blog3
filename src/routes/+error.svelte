<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
</script>

<svelte:head>
  <title>{page.status} · jungin.dev</title>
</svelte:head>

<main class="wrap read error">
  <div class="code">{page.status}</div>
  <h1>{page.error?.message ?? "Something went wrong"}</h1>
  <p><a href={resolve("/")}>&larr; Back to writing</a></p>
</main>

<style>
  .error {
    padding: 120px 0;
    text-align: center;
  }
  .code {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted-3);
    margin-bottom: 18px;
  }
  h1 {
    margin: 0 0 28px;
    font-family: var(--serif);
    font-size: 30px;
    font-weight: 500;
    letter-spacing: -0.02em;
  }
  a {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
  }
</style>
