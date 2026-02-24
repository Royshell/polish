<script setup lang="ts">
defineProps<{
  title: string
  icon?: string
}>()
</script>

<template>
  <div class="mx-2 my-2 border-2 border-polish-border [box-shadow:inset_1px_1px_0_rgba(255,255,255,0.06),inset_-1px_-1px_0_rgba(0,0,0,0.5)] hover:[box-shadow:inset_1px_1px_0_rgba(255,255,255,0.06),inset_-1px_-1px_0_rgba(0,0,0,0.5),0_0_20px_rgba(0,229,255,0.1)] transition-shadow">
    <!-- Title bar -->
    <div class="flex items-center gap-1.5 px-2.5 py-[5px] border-b border-polish-border bg-gradient-to-r from-polish-surface to-polish-panel font-pixel text-[8px] text-polish-cyan uppercase tracking-widest [text-shadow:0_0_8px_var(--color-polish-cyan)]">
      <span v-if="icon">{{ icon }}</span>
      {{ title }}
    </div>

    <!-- Body -->
    <div class="p-2.5">
      <slot />
    </div>
  </div>
</template>
