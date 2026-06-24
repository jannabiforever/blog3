<script lang="ts">
  import { site } from "$lib/config";
  import Eyebrow from "$lib/components/Eyebrow.svelte";

  /**
   * Newsletter signup. The site is fully static (no backend), so the form
   * posts to Buttondown's public embed-subscribe endpoint. With JS we intercept
   * and POST via `fetch` (mode "no-cors", since the endpoint isn't CORS-readable)
   * and optimistically confirm — Buttondown then sends a double-opt-in email.
   * Without JS the native `action`/`method` still submits to Buttondown.
   */
  const { username } = site.newsletter;
  const enabled = username.length > 0;
  const action = `https://buttondown.com/api/emails/embed-subscribe/${username}`;

  type Status = "idle" | "submitting" | "success" | "error";
  let status = $state<Status>("idle");
  let email = $state("");
  let trap = $state(""); // honeypot: bots fill it, humans never see it

  async function subscribe(event: SubmitEvent) {
    event.preventDefault();
    if (trap || status === "submitting" || !email) return;

    status = "submitting";
    try {
      await fetch(action, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({ email, embed: "1" }),
      });
      status = "success";
    } catch {
      status = "error";
    }
  }
</script>

<svelte:head>
  <title>Subscribe · yujungin.com</title>
  <meta name="description" content="Subscribe to new essays." />
</svelte:head>

<main class="wrap max-w-170 pt-20 pb-25 text-center">
  <Eyebrow tone="accent" tracking="0.12em" mb={20}>Subscribe</Eyebrow>
  <h1
    class="mx-auto max-w-130 font-serif text-[30px] leading-[1.2] font-medium tracking-[-0.02em] text-balance"
  >
    Get new essays in your reader or inbox.
  </h1>

  {#if !enabled}
    <p
      class="mx-auto mt-5.5 mb-8 max-w-110 font-serif text-[17px] leading-[1.55] text-secondary-2 italic"
    >
      The newsletter isn’t open yet. For now, follow along over
      <a href={site.social.rss} rel="external" class="text-accent">RSS</a>.
    </p>
  {:else if status === "success"}
    <p
      class="mx-auto mt-5.5 max-w-110 font-serif text-[17px] leading-[1.55] text-secondary-2 italic"
    >
      Almost there — check your inbox and confirm your subscription. Welcome aboard.
    </p>
  {:else}
    <p
      class="mx-auto mt-5.5 mb-8 max-w-110 font-serif text-[17px] leading-[1.55] text-secondary-2 italic"
    >
      New writing, sent when it’s ready — no schedule, no noise. Prefer a reader? There’s
      <a href={site.social.rss} rel="external" class="text-accent">RSS</a>.
    </p>

    <form
      class="mx-auto flex max-w-105 justify-center gap-2.5"
      {action}
      method="post"
      onsubmit={subscribe}
    >
      <input
        type="email"
        name="email"
        bind:value={email}
        placeholder="you@example.com"
        aria-label="Email address"
        required
        autocomplete="email"
        disabled={status === "submitting"}
        class="flex-1 rounded-full border border-subscribe-border bg-surface px-3.5 py-2.5 font-sans text-[14px] text-ink focus:border-accent focus:outline-none disabled:opacity-60"
      />
      <!-- Honeypot: off-screen, never tabbed to, not autofilled. -->
      <input
        type="text"
        name="hp-website"
        bind:value={trap}
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        class="absolute left-[-9999px] h-px w-px opacity-0"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        class="cursor-pointer rounded-full border-none bg-accent px-4.5 py-2.5 font-mono text-[11px] tracking-[0.08em] text-surface uppercase disabled:cursor-default disabled:opacity-70"
      >
        {status === "submitting" ? "Sending…" : "Notify me"}
      </button>
    </form>

    {#if status === "error"}
      <p class="mx-auto mt-4 max-w-105 font-sans text-[13px] text-muted-3">
        Something went wrong. Please try again, or subscribe via
        <a href={site.social.rss} rel="external" class="text-accent">RSS</a>.
      </p>
    {/if}
  {/if}
</main>
