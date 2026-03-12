<script setup lang="ts">
import { usePolishStore, SYSTEM_PRESETS } from '../../stores/polishStore';

const store = usePolishStore();

async function onSelect(event: Event) {
  const id = (event.target as HTMLSelectElement).value;
  if (!id) return;
  await store.applySystemPreset(id);
}
</script>

<template>
  <div class="px-2.5 py-2 border-b border-polish-border flex items-center gap-2">

    <span class="font-mono text-[11px] text-polish-dim shrink-0">Theme:</span>

    <!-- Select -->
    <div class="relative flex-1">
      <select
        class="w-full bg-[#050510] border text-polish-green font-vt text-[15px] px-2 pr-7 py-1 outline-none cursor-pointer appearance-none transition-[border-color,box-shadow]"
        :class="store.selectedPreset
          ? 'border-polish-green [box-shadow:0_0_8px_rgba(0,255,136,0.2)]'
          : 'border-polish-dim animate-[subtlePulse_3s_ease-in-out_infinite]'"
        :value="store.selectedPreset"
        @change="onSelect"
      >
        <option value="" disabled :selected="!store.selectedPreset">✦ Choose a vibe...</option>
        <option v-for="p in SYSTEM_PRESETS" :key="p.id" :value="p.id">{{ p.label }}</option>
      </select>
      <span
        class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none transition-colors"
        :class="store.selectedPreset ? 'text-polish-green' : 'text-polish-dim'"
      >▼</span>
    </div>

  </div>
</template>
