<script setup lang="ts">
defineProps<{
  variant?: "primary" | "danger" | "gold" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <button
    class="font-pixel cursor-pointer relative overflow-hidden transition-[filter,transform] hover:brightness-125 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      /* size */
      size === 'sm'
        ? 'text-[7px] px-2.25 py-1.25'
        : size === 'lg'
        ? 'text-[11px] px-4.5 py-2.75 w-full'
        : 'text-[9px] px-3.5 py-2',

      /* variant */
      variant === 'danger'
        ? 'bg-[#1a0808] border-2 border-polish-red text-polish-red [text-shadow:0_0_6px_var(--color-polish-red)] [box-shadow:0_0_8px_rgba(255,34,68,0.2)] hover:bg-polish-red hover:text-black'
        : variant === 'gold'
        ? 'border-none text-black [background:linear-gradient(90deg,#ff8800,#ffcc00,#ff8800)] bg-size-[200%] [box-shadow:0_0_15px_rgba(255,204,0,0.4)] animate-[goldShift_2s_linear_infinite]'
        : variant === 'ghost'
        ? 'bg-transparent border-2 border-polish-cyan text-polish-cyan [text-shadow:0_0_6px_var(--color-polish-cyan)]'
        : /* primary default */
          'text-white border-2 border-transparent [background:linear-gradient(90deg,#0044cc,#0077ff,#0044cc)] bg-size-[200%] [box-shadow:0_0_15px_rgba(0,119,255,0.4)] animate-[btnShift_3s_linear_infinite]',
    ]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <!-- shine sweep for primary + gold -->
    <span
      v-if="!variant || variant === 'primary' || variant === 'gold'"
      class="absolute top-0 -left-full w-[60%] h-full pointer-events-none [background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] animate-[shine_2.5s_ease-in-out_infinite]"
    />

    <span
      v-if="loading"
      class="inline-block mr-1.5 text-polish-green animate-[blink_0.8s_step-end_infinite]"
      >█</span
    >
    <slot />
  </button>
</template>
