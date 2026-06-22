<script lang="ts">
  import "../app.css";
  import "katex/dist/katex.min.css";
  import type { Snippet } from "svelte";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen flex-col">
  <Header />
  <div class="flex-1">
    {@render children()}
  </div>
  <Footer />
</div>
