<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div
    class="flex items-center justify-between px-1 py-[5px] border-b border-polish-border last:border-b-0 cursor-pointer hover:bg-polish-green/5 transition-colors"
    @click="emit('update:modelValue', !modelValue)"
  >
    <!-- Label + checkbox -->
    <div class="flex items-center gap-2 font-mono text-[12px] text-polish-fg select-none">
      <div
        class="w-[13px] h-[13px] border flex items-center justify-center text-[9px] flex-shrink-0 transition-all"
        :class="modelValue
          ? 'border-polish-green bg-polish-green/15 text-polish-green shadow-glow-green'
          : 'border-polish-dim bg-polish-green/5 text-transparent'"
      >
        ✓
      </div>
      {{ label }}
    </div>

    <!-- ON / OFF badge -->
    <span
      class="font-pixel text-[7px] px-[7px] py-[3px] border-2 transition-all"
      :class="modelValue
        ? 'bg-[#002200] border-polish-green text-polish-green [text-shadow:0_0_6px_var(--color-polish-green)] [box-shadow:0_0_8px_rgba(0,255,136,0.5),inset_0_0_4px_rgba(0,255,136,0.1)]'
        : 'bg-[#1a0808] border-polish-dim text-polish-dim'"
    >
      {{ modelValue ? 'ON' : 'OFF' }}
    </span>
  </div>
</template>
