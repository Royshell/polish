<script setup lang="ts">
import { ref, computed } from 'vue';
import SectionCard from '../layout/SectionCard.vue';
import { usePolishStore } from '../../stores/polishStore';
import { VISIBLE_PRESET_LIMIT } from '../../constants';

const store = usePolishStore();

// ── Save flow ──────────────────────────────────────────────────────────────
const isSaving  = ref(false);
const saveName  = ref('');
const saveInput = ref<HTMLInputElement | null>(null);

function startSave() {
  const count = (store.presets?.length ?? 0) + 1;
  saveName.value  = store.lastAppliedSource === 'ai' ? `AI Style ${count}` : `Polish ${count}`;
  isSaving.value  = true;
  setTimeout(() => saveInput.value?.select(), 50);
}

function cancelSave() {
  isSaving.value = false;
  saveName.value = '';
}

async function confirmSave() {
  if (!saveName.value.trim()) return;
  await store.savePreset(saveName.value);
  isSaving.value = false;
  saveName.value = '';
}

function handleSaveKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter')  confirmSave();
  if (e.key === 'Escape') cancelSave();
}

// ── Rename flow ────────────────────────────────────────────────────────────
const renamingId   = ref<string | null>(null);
const renameValue  = ref('');

function startRename(id: string, currentName: string) {
  renamingId.value  = id;
  renameValue.value = currentName;
}

async function confirmRename(id: string) {
  if (!renameValue.value.trim()) return;
  await store.renamePreset(id, renameValue.value);
  renamingId.value = null;
}

function handleRenameKeydown(e: KeyboardEvent, id: string) {
  if (e.key === 'Enter')  confirmRename(id);
  if (e.key === 'Escape') renamingId.value = null;
}

// ── Display ────────────────────────────────────────────────────────────────
const showAll = ref(false);

const visiblePresets = computed(() =>
  showAll.value ? store.presets : store.presets.slice(0, VISIBLE_PRESET_LIMIT),
);

const hiddenCount = computed(() =>
  Math.max(0, store.presets.length - VISIBLE_PRESET_LIMIT),
);

const canSave = computed(() => !!store.lastAppliedCSS && !isSaving.value);
</script>

<template>
  <SectionCard title="My Presets">

    <!-- Empty state -->
    <div
      v-if="store.presets.length === 0 && !isSaving"
      class="py-3 text-center font-mono text-[10px] text-polish-dim leading-relaxed"
    >
      <div class="text-xl mb-1 opacity-40">◈</div>
      No presets saved yet.<br />
      Apply a style, then save it.
    </div>

    <!-- Preset list -->
    <div v-else-if="store.presets.length > 0" class="flex flex-col gap-0.75 mb-1">
      <div
        v-for="preset in visiblePresets"
        :key="preset.id"
        class="flex items-center gap-1.5 px-2 py-1.25 border transition-colors group cursor-pointer"
        :class="store.activePresetId === preset.id
          ? 'border-polish-green bg-polish-green/5'
          : 'border-polish-border hover:border-polish-dim'"
        @click="store.applyPreset(preset.id)"
      >
        <!-- Source icon -->
        <span
          class="text-[9px] shrink-0"
          :class="preset.source === 'ai' ? 'text-polish-magenta' : 'text-polish-cyan'"
        >
          {{ preset.source === 'ai' ? '◈' : '⬛' }}
        </span>

        <!-- Active indicator -->
        <span
          v-if="store.activePresetId === preset.id"
          class="text-[9px] text-polish-green shrink-0"
        >✓</span>

        <!-- Name / rename input -->
        <div class="flex-1 min-w-0">
          <input
            v-if="renamingId === preset.id"
            v-model="renameValue"
            class="w-full bg-transparent border-b border-polish-cyan text-polish-green font-mono text-[11px] outline-none py-0"
            autofocus
            @keydown="handleRenameKeydown($event, preset.id)"
            @blur="confirmRename(preset.id)"
            @click.stop
          />
          <span
            v-else
            class="font-mono text-[11px] truncate block transition-colors"
            :class="store.activePresetId === preset.id ? 'text-polish-green' : 'text-polish-fg'"
            title="Double-click to rename"
            @dblclick.stop="startRename(preset.id, preset.name)"
          >
            {{ preset.name }}
          </span>
        </div>

        <!-- Delete — visible on row hover only -->
        <button
          class="font-pixel text-[7px] px-1.25 py-0.75 border border-transparent text-transparent group-hover:border-polish-dim group-hover:text-polish-dim hover:!border-polish-red hover:!text-polish-red transition-all cursor-pointer shrink-0"
          title="Delete"
          @click.stop="store.deletePreset(preset.id)"
        >
          ✕
        </button>
      </div>

      <!-- Show more / less -->
      <button
        v-if="hiddenCount > 0 || showAll"
        class="font-mono text-[10px] text-polish-dim hover:text-polish-cyan transition-colors py-1 text-left cursor-pointer"
        @click="showAll = !showAll"
      >
        {{ showAll ? '▲ Show less' : `▼ +${hiddenCount} more` }}
      </button>
    </div>

    <!-- Divider + save row -->
    <div class="border-t border-[#111128] mt-1 pt-2">

      <!-- Inline save form -->
      <div v-if="isSaving" class="flex items-center gap-1.5">
        <span class="text-polish-green text-[10px] shrink-0 font-mono">Name:</span>
        <input
          ref="saveInput"
          v-model="saveName"
          class="flex-1 bg-[#020208] border border-polish-green text-polish-green font-mono text-[11px] px-2 py-1 outline-none [box-shadow:0_0_6px_rgba(0,255,136,0.2)]"
          placeholder="My style..."
          @keydown="handleSaveKeydown"
        />
        <button
          class="font-pixel text-[7px] px-1.75 py-1.25 bg-[#002200] border-2 border-polish-green text-polish-green hover:bg-polish-green hover:text-black transition-all cursor-pointer"
          @click="confirmSave"
        >
          ✓
        </button>
        <button
          class="font-pixel text-[7px] px-1.75 py-1.25 bg-[#1a0808] border-2 border-polish-dim text-polish-dim hover:border-polish-red hover:text-polish-red transition-all cursor-pointer"
          @click="cancelSave"
        >
          ✕
        </button>
      </div>

      <!-- Save trigger -->
      <button
        v-else
        class="flex items-center gap-1.5 w-full font-mono text-[11px] py-1.25 transition-colors"
        :class="canSave
          ? 'text-polish-green hover:text-polish-yellow cursor-pointer'
          : 'text-polish-dim cursor-not-allowed opacity-50'"
        :disabled="!canSave"
        :title="canSave ? 'Save current style as preset' : 'Apply a style first'"
        @click="canSave && startSave()"
      >
        <span class="text-sm leading-none">+</span>
        Save current style
      </button>

    </div>
  </SectionCard>
</template>
