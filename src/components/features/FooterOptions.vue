<script setup lang="ts">
import { usePolishStore } from '../../stores/polishStore';

const store = usePolishStore();
</script>

<template>
  <footer class="mt-auto border-t border-polish-border px-2.5 py-2 shrink-0">

    <!-- Full row is clickable -->
    <div
      class="flex items-center gap-2 font-mono text-[11px] py-1.5 cursor-pointer select-none transition-colors rounded"
      :class="store.autoApply ? 'text-polish-cyan' : 'text-polish-dim hover:text-polish-fg'"
      @click="store.toggleAutoApply()"
    >
      <div
        class="w-3.5 h-3.5 border flex items-center justify-center text-[9px] shrink-0 transition-all"
        :class="store.autoApply
          ? 'border-polish-cyan bg-polish-cyan/12 text-polish-cyan [box-shadow:0_0_6px_rgba(0,229,255,0.3)]'
          : 'border-polish-dim bg-transparent text-transparent'"
      >✓</div>
      Apply automatically on this site
    </div>

    <div class="flex items-center justify-end pt-2 mt-1 border-t border-[#111128]">
      <button
        class="font-pixel text-[8px] px-3 py-1.5 border-2 border-polish-red text-polish-red [box-shadow:0_0_8px_rgba(255,34,68,0.25)] hover:[box-shadow:0_0_16px_rgba(255,34,68,0.6)] hover:bg-polish-red/10 transition-all cursor-pointer bg-transparent"
        @click="store.resetAll()"
      >
        RESET ALL
      </button>
    </div>

  </footer>
</template>
