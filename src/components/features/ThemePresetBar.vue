<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { usePolishStore, SYSTEM_PRESETS } from '../../stores/polishStore';

const store = usePolishStore();
const { selectedPreset } = storeToRefs(store);

const localSelected = ref(selectedPreset.value);

watch(selectedPreset, (newValue) => {
  localSelected.value = newValue;
});

async function onSelect(event: Event) {
  const id = (event.target as HTMLSelectElement).value;
  if (!id) {
    return;
  }
  await store.applySystemPreset(id);
}
</script>

<template>
  <div class="px-2.5 py-2 border-b border-polish-border flex items-center gap-2">
    <span class="font-mono text-[11px] text-polish-dim shrink-0">Theme:</span>

    <div class="relative flex-1">
      <select
        v-model="localSelected"
        class="w-full bg-[#050510] border text-polish-green font-vt text-[15px] px-2 pr-7 py-1 outline-none cursor-pointer appearance-none transition-[border-color,box-shadow]"
        :class="
          selectedPreset
            ? 'border-polish-green [box-shadow:0_0_8px_rgba(0,255,136,0.2)]'
            : 'border-polish-dim animate-[subtlePulse_3s_ease-in-out_infinite]'
        "
        @change="onSelect"
      >
        <option value="">✦ Choose a vibe...</option>
        <option v-for="preset in SYSTEM_PRESETS" :key="preset.id" :value="preset.id">
          {{ preset.label }}
        </option>
      </select>
      <span
        class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none transition-colors"
        :class="selectedPreset ? 'text-polish-green' : 'text-polish-dim'"
        >▼</span
      >
    </div>
  </div>
</template>
