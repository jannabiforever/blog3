<script lang="ts">
  import { site, author } from "$lib/config";
</script>

<footer class="border-t border-hair bg-surface">
  <div
    class="wrap grid max-w-[70rem] grid-cols-[1fr_auto] items-end gap-6 py-12 max-[560px]:grid-cols-1 max-[560px]:items-start"
  >
    <div>
      <div class="mb-2 font-serif text-[19px] font-medium">
        jungin<span class="text-accent">.dev</span>
      </div>
      <p class="m-0 max-w-[340px] text-[13px] leading-[1.6] text-muted-3">
        A personal journal by {author.name} on software, with frequent detours into math and physics.
      </p>
    </div>
    <nav class="flex gap-[22px] font-mono text-[12px]">
      <a href={site.social.github} rel="external" class="text-secondary-3 hover:text-ink">GitHub</a>
      <a href={site.social.rss} rel="external" class="text-secondary-3 hover:text-ink">RSS</a>
      <a href={site.social.email} rel="external" class="text-secondary-3 hover:text-ink">Email</a>
    </nav>
  </div>
</footer>
