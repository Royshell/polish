<script setup lang="ts">
import { ref } from 'vue';
import SectionCard from '../layout/SectionCard.vue';
import { usePolishStore } from '../../stores/polishStore';

const store = usePolishStore();

const prompt = ref('');
const PLACEHOLDERS = [
  'Make this look like a retro arcade cabinet…',
  'Transform into a luxury magazine layout…',
  'Apply dark cyberpunk neon aesthetic…',
  'Give it a minimal Japanese newspaper feel…',
  'Style like an old Terminal green-on-black…',
];
const placeholder = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];

const errorMsg = ref('');

async function handleGenerate() {
  if (!prompt.value.trim() || store.isGenerating) return;
  errorMsg.value = '';
  try {
    await store.generateAiStyle(prompt.value.trim());
    store.selectedPreset = '';
  } catch (err) {
    errorMsg.value = String(err).replace('Error: ', '');
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleGenerate();
  }
}
</script>

<template>
  <SectionCard title="AI Style" icon="◈">
    <textarea
      v-model="prompt"
      class="w-full h-20 bg-[#020208] border border-polish-dim text-polish-cyan font-mono text-[11px] p-2 resize-none outline-none leading-relaxed transition-[border-color,box-shadow] focus:border-polish-cyan disabled:opacity-50 disabled:cursor-not-allowed"
      :placeholder="placeholder"
      :disabled="store.isGenerating"
      @keydown="handleKeydown"
    ></textarea>

    <p class="font-mono text-[9px] text-polish-dim mt-1 text-right">
      Enter to generate · Shift+Enter for new line
    </p>

    <p
      v-if="errorMsg"
      class="font-mono text-[9px] text-polish-red mt-1 flex items-center gap-1"
    >
      <span>⚠</span> {{ errorMsg }}
    </p>

    <button
      class="w-full mt-2 font-pixel text-[9px] text-black flex items-center justify-center cursor-pointer transition-[filter,box-shadow] hover:brightness-110 hover:[box-shadow:0_0_30px_rgba(255,204,0,0.7)] disabled:bg-[#333] disabled:text-[#666] disabled:cursor-not-allowed disabled:animate-none disabled:[box-shadow:none] border-none [background:linear-gradient(90deg,#ff6600,#ffcc00,#ffee44,#ffcc00,#ff6600)] bg-size-[300%] [box-shadow:0_0_20px_rgba(255,204,0,0.45)] animate-[goldShift_3s_linear_infinite] relative overflow-hidden"
      style="height: 44px"
      :disabled="store.isGenerating || !prompt.trim()"
      @click="handleGenerate"
    >
      <span
        class="absolute top-0 -left-full w-[60%] h-full pointer-events-none [background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] animate-[shine_2.5s_ease-in-out_infinite]"
      ></span>

      <template v-if="store.isGenerating">
        <span class="animate-[dotFade_1.2s_infinite] text-[16px]">.</span>
        <span class="animate-[dotFade_1.2s_0.2s_infinite] text-[16px]">.</span>
        <span class="animate-[dotFade_1.2s_0.4s_infinite] text-[16px]">.</span>
      </template>
      <template v-else>
        <span>GENERATE</span>
        <span
          class="ml-2 mb-1 animate-[arrowPulse_0.8s_ease-in-out_infinite_alternate] text-[8px]"
          >&#x25B6;</span
        >
      </template>
    </button>
  </SectionCard>
</template>
