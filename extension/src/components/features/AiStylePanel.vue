<script setup lang="ts">
import { ref } from 'vue';
import SectionCard from '../layout/SectionCard.vue';
import { usePolishStore } from '../../stores/polishStore';

const store = usePolishStore();

const prompt = ref('');
const PLACEHOLDERS = [
  'Make this website look like a retro arcade…',
  'Transform into a luxury magazine layout…',
  'Apply dark cyberpunk neon aesthetic…',
  'Give it a minimal Japanese feel…',
];
const placeholder = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];

function handleGenerate() {
  if (!prompt.value.trim() || store.isGenerating) return;
  store.generateAiStyle(prompt.value.trim());
}
</script>

<template>
  <SectionCard title="AI Style" icon="◈">
    <textarea
      v-model="prompt"
      class="w-full h-17 bg-[#020208] border border-polish-dim text-polish-cyan font-mono text-[11px] p-2 resize-none outline-none leading-relaxed transition-[border-color,box-shadow] focus:border-polish-cyan focus:shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
      :placeholder="placeholder"
      :disabled="store.isGenerating"
      @keydown.meta.enter="handleGenerate"
      @keydown.ctrl.enter="handleGenerate"
    />

    <p class="font-mono text-[9px] text-polish-dim mt-1 text-right">⌘ + Enter to generate</p>

    <button
      class="w-full mt-2 py-2.5 font-pixel text-[9px] text-black flex items-center justify-center gap-2 transition-[filter] hover:brightness-115 disabled:bg-[#333] disabled:text-[#666] disabled:cursor-not-allowed disabled:animate-none disabled:[box-shadow:none] border-none [background:linear-gradient(90deg,#ff8800,#ffcc00,#ff8800)] bg-size-[200%] [box-shadow:0_0_15px_rgba(255,204,0,0.35)] animate-[goldShift_2s_linear_infinite]"
      :disabled="store.isGenerating || !prompt.trim()"
      @click="handleGenerate"
    >
      <template v-if="store.isGenerating">
        <span class="animate-[dotFade_1.2s_infinite] text-[14px]">.</span>
        <span class="animate-[dotFade_1.2s_0.2s_infinite] text-[14px]">.</span>
        <span class="animate-[dotFade_1.2s_0.4s_infinite] text-[14px]">.</span>
      </template>
      <template v-else>
        Generate
        <span class="inline-block animate-[arrowPulse_0.8s_ease-in-out_infinite_alternate]">→</span>
      </template>
    </button>
  </SectionCard>
</template>
