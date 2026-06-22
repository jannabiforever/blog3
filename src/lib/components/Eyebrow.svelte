<script lang="ts">
  import type { Snippet } from "svelte";

  /**
   * Mono uppercase micro-label used for category tags and section headers.
   * `tone` picks the color; `tracking` / `mb` vary per placement (kept inline
   * because they're dynamic per instance).
   */
  const TONE = {
    accent: "text-accent",
    section: "text-faint-3",
    meta: "text-muted-3",
  } as const;

  let {
    tone = "section",
    tracking = "0.1em",
    mb = 0,
    children,
  }: {
    tone?: keyof typeof TONE;
    tracking?: string;
    mb?: number;
    children: Snippet;
  } = $props();
</script>

<span
  class="block font-mono text-[11px] font-normal uppercase {TONE[tone]}"
  style="letter-spacing: {tracking}; margin-bottom: {mb}px;"
>
  {@render children()}
</span>
