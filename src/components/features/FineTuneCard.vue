<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePolishStore } from '../../stores/polishStore';
import { FONT_OPTIONS } from '../../constants';

const store = usePolishStore();
const open  = ref(false);

// Debounce helper — avoids hammering the store on every slider tick
let debounceTimer: ReturnType<typeof setTimeout>;
function debounced(fn: () => void, ms = 300) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, ms);
}

watch(
  () => ({ ...store.fineTune }),
  () => debounced(() => store.applyFineTune()),
  { deep: true },
);
</script>

<template>
  <!-- Accordion wrapper -->
  <div class="mx-2 my-2 border-2 border-polish-border transition-all">

    <!-- Header — click to toggle -->
    <button
      class="h-7 w-full flex items-center justify-between px-2.5 bg-linear-to-r from-polish-surface to-polish-panel cursor-pointer transition-colors border-b"
      :class="open ? 'border-polish-border' : 'border-transparent'"
      @click="open = !open"
    >
      <span class="flex items-center gap-2">
        <!-- CSS dot — dim when closed, cyan when open -->
        <span
          class="shrink-0 size-1.5 rounded-full transition-all"
          :class="open
            ? 'bg-polish-cyan [box-shadow:0_0_6px_var(--color-polish-cyan)]'
            : 'bg-polish-dim'"
        />
        <span
          class="font-pixel text-[8px] uppercase tracking-widest leading-none relative top-px transition-colors"
          :class="open
            ? 'text-polish-cyan [text-shadow:0_0_8px_var(--color-polish-cyan)]'
            : 'text-polish-dim'"
        >Fine-Tune</span>
      </span>
      <span
        class="font-pixel text-[8px] leading-none relative top-px transition-colors duration-200"
        :class="open ? 'text-polish-cyan' : 'text-polish-dim'"
      >{{ open ? '▴' : '▾' }}</span>
    </button>

    <!-- Body — collapsible -->
    <div v-if="open" class="p-2.5 flex flex-col gap-3">

      <!-- FONT SIZE -->
      <div class="flex flex-col gap-1.5">
        <div class="flex justify-between items-center">
          <span class="font-mono text-[11px] text-polish-fg">Body Size</span>
          <span class="font-pixel text-[9px] text-polish-cyan [text-shadow:0_0_6px_var(--color-polish-cyan)]">
            {{ store.fineTune.bodyFontSize }}px
          </span>
        </div>
        <div class="relative flex items-center gap-2">
          <span class="font-mono text-[9px] text-polish-dim shrink-0">12</span>
          <input
            type="range" min="12" max="22" step="1"
            :value="store.fineTune.bodyFontSize"
            @input="store.fineTune.bodyFontSize = +($event.target as HTMLInputElement).value"
            class="retro-slider flex-1"
          />
          <span class="font-mono text-[9px] text-polish-dim shrink-0">22</span>
        </div>
      </div>

      <!-- HEADING SCALE -->
      <div class="flex flex-col gap-1.5">
        <div class="flex justify-between items-center">
          <span class="font-mono text-[11px] text-polish-fg">Heading Scale</span>
          <span class="font-pixel text-[9px] text-polish-cyan [text-shadow:0_0_6px_var(--color-polish-cyan)]">
            {{ store.fineTune.headingScale.toFixed(1) }}×
          </span>
        </div>
        <div class="relative flex items-center gap-2">
          <span class="font-mono text-[9px] text-polish-dim shrink-0">0.8×</span>
          <input
            type="range" min="0.8" max="2.0" step="0.1"
            :value="store.fineTune.headingScale"
            @input="store.fineTune.headingScale = +($event.target as HTMLInputElement).value"
            class="retro-slider flex-1"
          />
          <span class="font-mono text-[9px] text-polish-dim shrink-0">2.0×</span>
        </div>
      </div>

      <div class="border-t border-polish-border" />

      <!-- COLORS -->
      <div class="flex flex-col gap-2">
        <span class="font-mono text-[11px] text-polish-fg">Colors</span>

        <div class="flex gap-2">
          <!-- Background -->
          <label class="flex-1 flex flex-col gap-1 cursor-pointer group">
            <span class="font-mono text-[9px] text-polish-dim group-hover:text-polish-fg transition-colors">Background</span>
            <div
              class="relative h-8 border-2 overflow-hidden transition-colors"
              :class="store.fineTune.bgColor ? 'border-polish-magenta' : 'border-polish-border'"
            >
              <input
                type="color"
                :value="store.fineTune.bgColor || '#1a1a1a'"
                @input="store.fineTune.bgColor = ($event.target as HTMLInputElement).value"
                class="absolute inset-0 size-full opacity-0 cursor-pointer"
              />
              <div class="size-full flex items-center justify-center gap-1.5">
                <div
                  class="size-3 border border-polish-border"
                  :style="store.fineTune.bgColor ? { background: store.fineTune.bgColor } : {}"
                />
                <span
                  class="font-mono text-[9px]"
                  :class="store.fineTune.bgColor ? 'text-polish-magenta' : 'text-polish-dim'"
                >
                  {{ store.fineTune.bgColor || 'pick' }}
                </span>
              </div>
            </div>
          </label>

          <!-- Text -->
          <label class="flex-1 flex flex-col gap-1 cursor-pointer group">
            <span class="font-mono text-[9px] text-polish-dim group-hover:text-polish-fg transition-colors">Text</span>
            <div
              class="relative h-8 border-2 overflow-hidden transition-colors"
              :class="store.fineTune.textColor ? 'border-polish-cyan' : 'border-polish-border'"
            >
              <input
                type="color"
                :value="store.fineTune.textColor || '#e8e8e8'"
                @input="store.fineTune.textColor = ($event.target as HTMLInputElement).value"
                class="absolute inset-0 size-full opacity-0 cursor-pointer"
              />
              <div class="size-full flex items-center justify-center gap-1.5">
                <div
                  class="size-3 border border-polish-border"
                  :style="store.fineTune.textColor ? { background: store.fineTune.textColor } : {}"
                />
                <span
                  class="font-mono text-[9px]"
                  :class="store.fineTune.textColor ? 'text-polish-cyan' : 'text-polish-dim'"
                >
                  {{ store.fineTune.textColor || 'pick' }}
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div class="border-t border-polish-border" />

      <!-- FONT FAMILY -->
      <div class="flex flex-col gap-1.5">
        <span class="font-mono text-[11px] text-polish-fg">Font</span>
        <div class="grid grid-cols-5 gap-1">
          <button
            v-for="opt in FONT_OPTIONS"
            :key="opt.value"
            class="py-1 px-0.5 font-mono text-[8px] border-2 transition-all truncate"
            :class="store.fineTune.fontFamily === opt.value
              ? 'border-polish-yellow text-polish-yellow bg-polish-yellow/10 [text-shadow:0_0_6px_var(--color-polish-yellow)]'
              : 'border-polish-border text-polish-dim hover:border-polish-fg hover:text-polish-fg'"
            @click="store.fineTune.fontFamily = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- CLEAR button -->
      <button
        class="w-full py-1.5 font-pixel text-[8px] border-2 border-polish-border text-polish-dim hover:border-polish-red hover:text-polish-red transition-colors cursor-pointer"
        @click="store.resetFineTune()"
      >
        ✕ Clear Fine-Tune
      </button>

    </div>
  </div>
</template>

<style scoped>
.retro-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: var(--color-polish-border);
  outline: none;
  cursor: pointer;
  position: relative;
}

.retro-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: var(--color-polish-magenta);
  border: 2px solid var(--color-polish-bg);
  box-shadow: 0 0 6px var(--color-polish-magenta);
  cursor: pointer;
  margin-top: -4px;
}

.retro-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: var(--color-polish-magenta);
  border: 2px solid var(--color-polish-bg);
  box-shadow: 0 0 6px var(--color-polish-magenta);
  cursor: pointer;
  border-radius: 0;
}

.retro-slider::-webkit-slider-runnable-track {
  height: 4px;
  background: var(--color-polish-border);
}
</style>
