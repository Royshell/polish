<script setup lang="ts">
  defineProps<{
    title: string;
    icon?: string; // kept for API compat — we render a CSS dot instead
    bodyClass?: string;
  }>();
</script>

<template>
  <div
    class="mx-2 my-2 border-2 border-polish-border [box-shadow:inset_1px_1px_0_rgba(255,255,255,0.06),inset_-1px_-1px_0_rgba(0,0,0,0.5)] hover:[box-shadow:inset_1px_1px_0_rgba(255,255,255,0.06),inset_-1px_-1px_0_rgba(0,0,0,0.5),0_0_20px_rgba(0,229,255,0.1)] transition-shadow">
    <!-- Title bar -->
    <div
      class="h-7 flex items-center gap-2 px-2.5 border-b border-polish-border bg-linear-to-r from-polish-surface to-polish-panel">
      <!-- CSS dot bullet — immune to font metric drift -->
      <span
        class="shrink-0 size-1.5 rounded-full bg-polish-cyan [box-shadow:0_0_6px_var(--color-polish-cyan)]" />
      <span
        class="font-pixel text-[8px] text-polish-cyan uppercase tracking-widest leading-none [text-shadow:0_0_8px_var(--color-polish-cyan)]">
        {{ title }}
      </span>
    </div>

    <!-- Body -->
    <div :class="bodyClass ?? 'p-2.5'">
      <slot />
    </div>
  </div>
</template>
