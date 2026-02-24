<script setup lang="ts">
import RetroButton from '../ui/RetroButton.vue'

defineProps<{ modelValue: string }>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  reset: []
}>()

const PRESETS = ['Cyber Mode', 'Clean & Clear', 'Dark Soul', 'Vaporwave', 'Newspaper', 'Minimalist']
</script>

<template>
  <div class="flex items-center gap-1.5 px-2.5 py-2 border-b border-polish-border">
    <span class="font-mono text-[11px] text-polish-dim flex-shrink-0">Theme:</span>

    <!-- Custom select wrapper -->
    <div class="relative flex-1">
      <select
        class="w-full bg-[#050510] border border-polish-dim text-polish-green font-vt text-[15px] px-2 pr-7 py-1 outline-none cursor-pointer appearance-none transition-[border-color,box-shadow] focus:border-polish-green focus:shadow-glow-green"
        :value="modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="p in PRESETS" :key="p" :value="p">{{ p }}</option>
      </select>
      <!-- Arrow -->
      <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-polish-green pointer-events-none">▼</span>
    </div>

    <RetroButton variant="danger" size="sm" @click="$emit('reset')">RESET</RetroButton>
  </div>
</template>
