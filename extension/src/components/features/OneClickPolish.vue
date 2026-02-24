<script setup lang="ts">
import SectionCard from '../layout/SectionCard.vue'
import RetroToggle from '../ui/RetroToggle.vue'
import type { PolishToggles } from '@/composables/usePolishState'  // ← fixed: use @/ alias

const props = defineProps<{
  toggles: PolishToggles
  isPolishing: boolean
}>()

const emit = defineEmits<{
  polish: []
  'update:toggles': [value: PolishToggles]
}>()

const TOGGLE_LABELS: { key: keyof PolishToggles; label: string }[] = [
  { key: 'moreContrast',  label: 'More Contrast'  },
  { key: 'extraSpacing',  label: 'Extra Spacing'   },
  { key: 'vibrantColors', label: 'Vibrant Colors'  },
  { key: 'betterFonts',   label: 'Better Fonts'    },
]
</script>

<template>
  <SectionCard title="One-Click Polish" icon="⬛">

    <!-- Polish button area -->
    <div class="relative pb-1.5">
      <span class="absolute top-[-6px] right-2.5 text-[16px] text-polish-yellow [text-shadow:0_0_8px_var(--color-polish-yellow)] pointer-events-none z-10 [animation:sparkle_1.5s_ease-in-out_infinite]">
        +✦
      </span>

      <button
        class="w-full py-[11px] font-pixel text-[11px] tracking-wide text-white relative overflow-hidden transition-[filter] hover:brightness-125 disabled:opacity-70 disabled:cursor-not-allowed
               border-[3px] border-transparent
               [background:linear-gradient(90deg,#0044cc,#0077ff,#0044cc)]
               [background-size:200%]
               [border-image:linear-gradient(90deg,var(--color-polish-red),var(--color-polish-magenta),var(--color-polish-yellow),var(--color-polish-magenta),var(--color-polish-red))_1]
               [box-shadow:0_0_15px_rgba(0,119,255,0.5),0_0_30px_rgba(0,119,255,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]
               [animation:btnShift_3s_linear_infinite]
               disabled:[animation:none] disabled:bg-[#111]"
        :disabled="isPolishing"
        @click="$emit('polish')"
      >
        <span class="absolute top-0 left-[-100%] w-[60%] h-full pointer-events-none [background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] [animation:shine_2.5s_ease-in-out_infinite]" />
        <span v-if="isPolishing" class="inline-block mr-1 text-polish-green [animation:blink_0.5s_step-end_infinite]">█</span>
        {{ isPolishing ? 'Polishing...' : 'Polish it !' }}
      </button>
    </div>

    <!-- Toggles -->
    <div class="mt-1.5 border-t border-[#111128]">
      <RetroToggle
        v-for="item in TOGGLE_LABELS"
        :key="item.key"
        :label="item.label"
        :model-value="props.toggles[item.key]"
        @update:model-value="emit('update:toggles', { ...props.toggles, [item.key]: $event })"
      />
    </div>
  </SectionCard>
</template>
