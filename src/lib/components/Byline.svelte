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

<div class="byline" class:center={align === "center"}>
  <div class="avatar">{initials}</div>
  <div class="meta">
    <div class="name">{name}</div>
    <div class="line">{dottedDate(date)} · {readTime}{suffix ? ` ${suffix}` : ""}</div>
  </div>
</div>

<style>
  .byline {
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .byline.center {
    display: inline-flex;
    text-align: left;
  }
  .avatar {
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: var(--avatar-bg);
    border: 1px solid var(--avatar-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 500;
    color: var(--accent);
  }
  .meta {
    line-height: 1.3;
  }
  .name {
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
  }
  .line {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--faint);
  }
</style>
