<script setup lang="ts">
import { ref } from 'vue';
import SectionCard from '../layout/SectionCard.vue';
import { usePolishStore } from '../../stores/polishStore';
import { AI_PLACEHOLDERS } from '../../constants';

const store = usePolishStore();

const prompt      = ref('');
const placeholder = AI_PLACEHOLDERS[Math.floor(Math.random() * AI_PLACEHOLDERS.length)];
const errorMsg    = ref('');

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
  // Enter alone = generate; Shift+Enter = newline
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleGenerate();
  }
}
</script>

<template>
  <SectionCard title="AI Style">

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
      class="relative w-full h-11 mt-2 overflow-hidden border-none font-pixel text-[9px] text-black flex items-center justify-center cursor-pointer transition-[filter,box-shadow] hover:brightness-110 hover:[box-shadow:0_0_30px_rgba(255,204,0,0.7)] disabled:bg-[#333] disabled:text-[#666] disabled:cursor-not-allowed disabled:animate-none disabled:[box-shadow:none] [background:linear-gradient(90deg,#ff6600,#ffcc00,#ffee44,#ffcc00,#ff6600)] bg-size-[300%] [box-shadow:0_0_20px_rgba(255,204,0,0.45)] animate-[goldShift_3s_linear_infinite]"
      :disabled="store.isGenerating || !prompt.trim()"
      @click="handleGenerate"
    >
      <!-- Shine sweep -->
      <span class="absolute top-0 -left-full w-3/5 h-full pointer-events-none [background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] animate-[shine_2.5s_ease-in-out_infinite]"></span>

      <template v-if="store.isGenerating">
        <span class="animate-[dotFade_1.2s_infinite] text-base">.</span>
        <span class="animate-[dotFade_1.2s_0.2s_infinite] text-base">.</span>
        <span class="animate-[dotFade_1.2s_0.4s_infinite] text-base">.</span>
      </template>
      <template v-else>
        <span class="tracking-widest">GENERATE</span>
      </template>
    </button>

  </SectionCard>
</template>
