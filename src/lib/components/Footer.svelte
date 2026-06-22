<script lang="ts">
  import { site } from "$lib/config";
</script>

<footer class="border-t border-hair bg-surface">
  <div
    class="wrap grid max-w-280 grid-cols-[1fr_auto] items-end gap-6 py-12 max-[560px]:grid-cols-1 max-[560px]:items-start"
  >
    <div>
      <div class="mb-2 font-serif text-[19px] font-medium">
        yujungin<span class="text-accent">.com</span>
      </div>
      <p class="m-0 max-w-85 text-[13px] leading-[1.6] text-muted-3">
        A personal journal by Jungin on software, with frequent detours into math and physics.
      </p>
    </div>
    <nav class="flex gap-5.5 font-mono text-[12px]">
      <a href={site.social.github} rel="external" class="text-secondary-3 hover:text-ink">GitHub</a>
      <a href={site.social.rss} rel="external" class="text-secondary-3 hover:text-ink">RSS</a>
      <a href={site.social.email} rel="external" class="text-secondary-3 hover:text-ink">Email</a>
    </nav>
  </div>
</footer>
