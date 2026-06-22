<script lang="ts">
  import type { Snippet } from "svelte";

  /**
   * Wraps compiled markdown and applies the editorial reading styles via
   * @tailwindcss/typography (`prose`) plus the overrides in app.css.
   */
  let { children }: { children: Snippet } = $props();
</script>

<div class="prose">
  {@render children()}
</div>
