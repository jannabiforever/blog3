<script lang="ts">
  import type { Snippet } from "svelte";

  /**
   * Wraps compiled markdown and applies the editorial reading styles via
   * @tailwindcss/typography (`prose`) plus the overrides in app.css.
   *
   * The copy button is baked into every code block at highlight time by the
   * Shiki pipeline (mdsvex.config.js), so it ships in the static HTML. Here we
   * only progressively enhance behaviour: one delegated click listener drives
   * the clipboard write. We flag the container as enhanced so the buttons stay
   * when JS is unavailable — a dead button is worse than none.
   */
  let { children }: { children: Snippet } = $props();

  let container: HTMLDivElement;

  async function copy(text: string): Promise<void> {
    // The site is only ever served from a secure context (HTTPS in prod,
    // localhost in dev), so the async Clipboard API is always available —
    // no deprecated execCommand fallback needed.
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* permission denied or transient failure — nothing more to do */
    }
  }

  $effect(() => {
    if (!container) return;
    container.dataset.enhanced = "";

    // Only one button shows the "copied" state at a time. Track it so copying a
    // second block resets the first immediately, rather than letting a shared
    // timer cancel the first block's revert and strand it on the check icon.
    let timer: ReturnType<typeof setTimeout>;
    let copied: HTMLButtonElement | null = null;
    function reset() {
      if (!copied) return;
      delete copied.dataset.copied;
      copied.setAttribute("aria-label", "Copy code");
      copied = null;
    }

    async function onClick(event: MouseEvent) {
      const btn = (event.target as Element).closest(".code-copy");
      if (!(btn instanceof HTMLButtonElement)) return;
      const code = btn.closest(".code-block")?.querySelector("code");
      await copy(code?.textContent ?? "");
      clearTimeout(timer);
      reset();
      btn.dataset.copied = "true";
      btn.setAttribute("aria-label", "Copied");
      copied = btn;
      timer = setTimeout(reset, 2000);
    }

    container.addEventListener("click", onClick);
    return () => {
      container.removeEventListener("click", onClick);
      clearTimeout(timer);
    };
  });
</script>

<div class="prose" bind:this={container}>
  {@render children()}
</div>
