<script lang="ts">
  import { dottedDate } from "$lib/utils/date";

  /** Avatar + author name + "date · readtime" meta line. */
  let {
    name,
    initials,
    date,
    readTime,
    suffix = "",
    align = "left",
  }: {
    name: string;
    initials: string;
    date: string;
    readTime: string;
    suffix?: string;
    align?: "left" | "center";
  } = $props();
</script>

<div class="{align === 'center' ? 'inline-flex text-left' : 'flex'} items-center gap-[11px]">
  <div
    class="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full border border-avatar-border bg-avatar-bg font-mono text-[11px] font-medium text-accent"
  >
    {initials}
  </div>
  <div class="leading-[1.3]">
    <div class="font-sans text-[13px] font-semibold text-ink">{name}</div>
    <div class="font-mono text-[11px] text-faint">
      {dottedDate(date)} · {readTime}{suffix ? ` ${suffix}` : ""}
    </div>
  </div>
</div>
