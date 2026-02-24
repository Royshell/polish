<script setup lang="ts">
import PanelHeader    from './components/layout/PanelHeader.vue'
import ThemePresetBar from './components/features/ThemePresetBar.vue'
import OneClickPolish from './components/features/OneClickPolish.vue'
import AiStylePanel   from './components/features/AiStylePanel.vue'
import FooterOptions  from './components/features/FooterOptions.vue'
import { usePolishState } from './composables/usePolishState'

const {
  selectedPreset,
  toggles,
  autoApply,
  isPolishing,
  isGenerating,
  resetToDefaults,
  applyPolish,
  generateAiStyle,
} = usePolishState()

function closePanel() {
  window.close()
}
</script>

<template>
  <div class="panel-root flex flex-col h-screen bg-polish-panel relative overflow-hidden">

    <PanelHeader
      @open-list="() => {}"
      @close="closePanel"
    />

    <p class="px-3 py-[5px] font-vt text-[15px] text-polish-dim border-b border-[#111128] tracking-wider flex-shrink-0">
      <span class="text-polish-green">>&nbsp;</span>Refine the web you're on
    </p>

    <ThemePresetBar v-model="selectedPreset" @reset="resetToDefaults" />

    <div class="flex-1 overflow-y-auto">
      <OneClickPolish
        :toggles="toggles"
        :is-polishing="isPolishing"
        @polish="applyPolish"
        @update:toggles="Object.assign(toggles, $event)"
      />

      <AiStylePanel :loading="isGenerating" @generate="generateAiStyle" />
    </div>

    <FooterOptions
      v-model:auto-apply="autoApply"
      @open-presets="() => {}"
    />
  </div>
</template>

<style scoped>
/* Only pseudo-element effects live here — everything else is Tailwind */

/* CRT scanlines */
.panel-root::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 136, 0.025) 0px,
    rgba(0, 255, 136, 0.025) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 50;
  animation: scanPulse 4s ease-in-out infinite;
}

/* Pixel grid */
.panel-root::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 255, 136, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 136, 0.025) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 0;
}

.panel-root > * {
  position: relative;
  z-index: 1;
}

/* Scrollbar */
.panel-root :deep(*::-webkit-scrollbar)       { width: 4px; }
.panel-root :deep(*::-webkit-scrollbar-track)  { background: transparent; }
.panel-root :deep(*::-webkit-scrollbar-thumb)  { background: var(--color-polish-border); }
.panel-root :deep(*::-webkit-scrollbar-thumb:hover) { background: var(--color-polish-dim); }
</style>
