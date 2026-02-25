<script setup lang="ts">
import RetroButton from "../ui/RetroButton.vue";

defineEmits<{
  openList: [];
  close: [];
}>();
</script>

<template>
  <header
    class="flex items-center justify-between px-3 py-2.5 bg-linear-to-br from-[#0a0a18] to-[#1a0a2e] border-b-2 border-polish-magenta [box-shadow:0_2px_20px_rgba(255,0,204,0.25)] shrink-0"
  >
    <!-- Logo -->
    <div class="flex items-center gap-1.5">
      <span
        class="font-pixel text-[16px] text-polish-green [text-shadow:0_0_10px_var(--color-polish-green),0_0_20px_var(--color-polish-green),2px_2px_0_#003322] tracking-wider"
      >
        Polish
      </span>
      <span
        class="text-[12px] text-polish-magenta [text-shadow:0_0_10px_var(--color-polish-magenta)] animate-[blink_1.2s_step-end_infinite]"
      >
        ✦⊕
      </span>
    </div>

    <!-- Nav buttons -->
    <div class="flex gap-1.5">
      <RetroButton variant="ghost" size="sm" @click="$emit('openList')">≡</RetroButton>
      <RetroButton variant="danger" size="sm" @click="$emit('close')">✕</RetroButton>
    </div>
  </header>
</template>
