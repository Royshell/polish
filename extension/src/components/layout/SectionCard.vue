<script setup lang="ts">
defineProps<{
  title: string;
  icon?: string; // kept for API compat but ignored — we use a CSS dot
}>();
</script>

<template>
  <div
    class="mx-2 my-2 border-2 border-polish-border [box-shadow:inset_1px_1px_0_rgba(255,255,255,0.06),inset_-1px_-1px_0_rgba(0,0,0,0.5)] hover:[box-shadow:inset_1px_1px_0_rgba(255,255,255,0.06),inset_-1px_-1px_0_rgba(0,0,0,0.5),0_0_20px_rgba(0,229,255,0.1)] transition-shadow"
  >
    <!-- Title bar -->
    <div
      class="flex items-center gap-2 px-2.5 border-b border-polish-border bg-linear-to-r from-polish-surface to-polish-panel"
      style="height: 28px;"
    >
      <!-- CSS dot bullet — no font metric issues -->
      <span
        class="shrink-0 rounded-full bg-polish-cyan"
        style="width: 6px; height: 6px; box-shadow: 0 0 6px var(--color-polish-cyan);"
      />
      <span
        class="font-pixel text-[8px] text-polish-cyan uppercase tracking-widest [text-shadow:0_0_8px_var(--color-polish-cyan)]"
        style="line-height: 1; position: relative; top: 1px;"
      >{{ title }}</span>
    </div>

    <!-- Body -->
    <div class="p-2.5">
      <slot />
    </div>
  </div>
</template>
