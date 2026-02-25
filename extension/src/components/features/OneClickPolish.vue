<script setup lang="ts">
import SectionCard from '../layout/SectionCard.vue';
import RetroToggle from '../ui/RetroToggle.vue';
import { usePolishStore } from '../../stores/polishStore';
import type { PolishToggles } from '../../stores/polishStore';

const store = usePolishStore();

const TOGGLE_LABELS: { key: keyof PolishToggles; label: string }[] = [
  { key: 'moreContrast',  label: 'More Contrast'  },
  { key: 'extraSpacing',  label: 'Extra Spacing'   },
  { key: 'vibrantColors', label: 'Vibrant Colors'  },
  { key: 'betterFonts',   label: 'Better Fonts'    },
];
</script>

<template>
  <SectionCard title="One-Click Polish" icon="⬛">

    <div class="relative pb-1.5">
      <span class="absolute -top-1.5 right-2.5 text-[16px] text-polish-yellow [text-shadow:0_0_8px_var(--color-polish-yellow)] pointer-events-none z-10 animate-[sparkle_1.5s_ease-in-out_infinite]">
        +✦
      </span>

      <button
        class="w-full py-2.75 font-pixel text-[11px] tracking-wide text-white relative overflow-hidden transition-[filter] hover:brightness-125 disabled:opacity-70 disabled:cursor-not-allowed border-[3px] border-transparent [background:linear-gradient(90deg,#0044cc,#0077ff,#0044cc)] bg-size-[200%] [border-image:linear-gradient(90deg,var(--color-polish-red),var(--color-polish-magenta),var(--color-polish-yellow),var(--color-polish-magenta),var(--color-polish-red))_1] [box-shadow:0_0_15px_rgba(0,119,255,0.5),0_0_30px_rgba(0,119,255,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] animate-[btnShift_3s_linear_infinite] disabled:animate-none disabled:bg-[#111] cursor-pointer"
        :disabled="store.isPolishing"
        @click="store.applyPolish()"
      >
        <span class="absolute top-0 -left-full w-[60%] h-full pointer-events-none [background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shine_3.75s_ease-in-out_infinite]" />
        <span v-if="store.isPolishing" class="inline-block mr-1 text-polish-green animate-[blink_0.5s_step-end_infinite]">█</span>
        {{ store.isPolishing ? 'Polishing...' : 'Polish it!' }}
      </button>
    </div>

    <div class="mt-1.5 border-t border-[#111128]">
      <RetroToggle
        v-for="item in TOGGLE_LABELS"
        :key="item.key"
        :label="item.label"
        :model-value="store.toggles[item.key]"
        @update:model-value="store.setToggle(item.key, $event)"
      />
    </div>

  </SectionCard>
</template>
