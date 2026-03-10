<script setup lang="ts">
import { usePolishStore } from '../../stores/polishStore';

const store = usePolishStore();

defineEmits<{ openPresets: [] }>();
</script>

<template>
  <footer class="mt-auto border-t border-polish-border px-2.5 py-2 shrink-0">

    <label class="flex items-center gap-2 font-mono text-[11px] text-polish-dim py-1 cursor-pointer hover:text-polish-fg transition-colors select-none">
      <div
        class="w-3.5 h-3.5 border flex items-center justify-center text-[9px] shrink-0 transition-all"
        :class="store.autoApply
          ? 'border-polish-cyan bg-polish-cyan/12 text-polish-cyan [box-shadow:0_0_6px_rgba(0,229,255,0.3)]'
          : 'border-polish-dim bg-transparent text-transparent'"
        @click="store.toggleAutoApply()"
      >
        ✓
      </div>
      Apply automatically on this site
    </label>

    <div class="flex items-center justify-between pt-2 mt-1 border-t border-[#111128]">
      <button
        class="flex items-center gap-1.5 font-mono text-[11px] text-polish-magenta bg-transparent hover:text-polish-yellow transition-colors cursor-pointer"
        @click="$emit('openPresets')"
      >
        <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor" class="shrink-0">
          <rect x="0" y="0" width="5" height="5" rx="1"/>
          <rect x="7" y="0" width="5" height="5" rx="1"/>
          <rect x="0" y="7" width="5" height="5" rx="1"/>
          <rect x="7" y="7" width="5" height="5" rx="1"/>
        </svg>
        Manage presets..
      </button>

      <button
        class="font-pixel text-[8px] px-3 py-1.5 border-2 border-polish-red text-polish-red [box-shadow:0_0_8px_rgba(255,34,68,0.25)] hover:[box-shadow:0_0_16px_rgba(255,34,68,0.6)] hover:bg-polish-red/10 transition-all cursor-pointer bg-transparent"
        @click="store.resetAll()"
      >
        RESET ALL
      </button>
    </div>
  </footer>
</template>
