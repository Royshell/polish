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
    // Reset theme selector — AI overrides any system preset
    store.selectedPreset = '';
  } catch (err) {
    errorMsg.value = String(err).replace('Error: ', '');
  }
}

function handleKeydown(e: KeyboardEvent) {
  // Enter alone = generate, Shift+Enter = newline
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
    />

    <p class="font-mono text-[9px] text-polish-dim mt-1 text-right">
      Enter to generate · Shift+Enter for new line
    </p>

    <p v-if="errorMsg" class="font-mono text-[9px] text-polish-red mt-1 flex items-center gap-1">
      <span>⚠</span> {{ errorMsg }}
    </p>

    <button
      class="w-full mt-2 font-pixel text-[9px] text-black flex items-center justify-center gap-2 cursor-pointer transition-[filter] hover:brightness-115 disabled:bg-[#333] disabled:text-[#666] disabled:cursor-not-allowed disabled:animate-none disabled:[box-shadow:none] border-none [background:linear-gradient(90deg,#ff8800,#ffcc00,#ff8800)] bg-size-[200%] [box-shadow:0_0_15px_rgba(255,204,0,0.35)] animate-[goldShift_2s_linear_infinite]"
      style="height: 40px;"
      :disabled="store.isGenerating || !prompt.trim()"
      @click="handleGenerate"
    >
      <template v-if="store.isGenerating">
        <span class="animate-[dotFade_1.2s_infinite]">.</span>
        <span class="animate-[dotFade_1.2s_0.2s_infinite]">.</span>
        <span class="animate-[dotFade_1.2s_0.4s_infinite]">.</span>
      </template>
      <template v-else>
        <span>Generate</span>
        <svg
          class="animate-[arrowPulse_0.8s_ease-in-out_infinite_alternate]"
          width="14" height="14" viewBox="0 0 14 14" fill="currentColor"
          style="display: inline-block; vertical-align: middle; position: relative; top: -1px; flex-shrink: 0;"
        >
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </template>
    </button>

  </SectionCard>
</template>
