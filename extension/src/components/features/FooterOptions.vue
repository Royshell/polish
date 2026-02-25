<script setup lang="ts">
defineProps<{ autoApply: boolean }>();
const emit = defineEmits<{
  "update:autoApply": [value: boolean];
  openPresets: [];
}>();
</script>

<template>
  <footer class="mt-auto border-t border-polish-border px-2.5 py-2 shrink-0">
    <!-- Auto-apply row -->
    <label
      class="flex items-center gap-2 font-mono text-[11px] text-polish-dim py-1 cursor-pointer hover:text-polish-fg transition-colors select-none"
    >
      <div
        class="w-3.5 h-3.5 border flex items-center justify-center text-[9px] shrink-0 transition-all"
        :class="
          autoApply
            ? 'border-polish-cyan bg-polish-cyan/12 text-polish-cyan [box-shadow:0_0_6px_rgba(0,229,255,0.3)]'
            : 'border-polish-dim bg-transparent text-transparent'
        "
        @click="emit('update:autoApply', !autoApply)"
      >
        ✓
      </div>
      Apply automatically on this site
    </label>

    <!-- Manage presets -->
    <button
      class="flex items-center gap-1.5 font-mono text-[11px] text-polish-magenta py-1.5 pt-2 border-t border-[#111128] mt-1 w-full bg-transparent hover:text-polish-yellow transition-colors cursor-pointer border-l-0 border-r-0 border-b-0"
      @click="$emit('openPresets')"
    >
      <svg
        viewBox="0 0 12 12"
        width="12"
        height="12"
        fill="currentColor"
        class="shrink-0"
      >
        <rect x="0" y="0" width="5" height="5" rx="1" />
        <rect x="7" y="0" width="5" height="5" rx="1" />
        <rect x="0" y="7" width="5" height="5" rx="1" />
        <rect x="7" y="7" width="5" height="5" rx="1" />
      </svg>
      Manage presets..
    </button>
  </footer>
</template>
