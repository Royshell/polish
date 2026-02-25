import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';

export interface PolishToggles {
  moreContrast: boolean;
  extraSpacing: boolean;
  vibrantColors: boolean;
  betterFonts: boolean;
}

export interface UserPreset {
  id: string;
  name: string;
  css: string;
  source: 'toggles' | 'ai';
  createdAt: number;
}

const DEFAULT_TOGGLES: PolishToggles = {
  moreContrast: true,
  extraSpacing: true,
  vibrantColors: true,
  betterFonts: true,
};

const STORAGE_KEY = 'polish_presets';

export const usePolishStore = defineStore('polish', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const selectedPreset = ref('Cyber Mode');
  const toggles = reactive<PolishToggles>({ ...DEFAULT_TOGGLES });
  const aiPrompt = ref('');
  const autoApply = ref(false);
  const isPolishing = ref(false);
  const isGenerating = ref(false);
  const lastAppliedCSS = ref<string | null>(null);
  const lastAppliedSource = ref<'toggles' | 'ai' | null>(null);
  const presets = ref<UserPreset[]>([]);
  const activePresetId = ref<string | null>(null);

  // ── Init — called explicitly from main.ts after app mounts ────────────────
  // NOT called at module load time — chrome.storage isn't ready yet then.
  function init() {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        presets.value = result[STORAGE_KEY] as UserPreset[];
      }
    });
  }

  // ── Core Actions ───────────────────────────────────────────────────────────
  function resetToDefaults() {
    Object.assign(toggles, DEFAULT_TOGGLES);
    selectedPreset.value = 'Cyber Mode';
    aiPrompt.value = '';
  }

  function setToggle(key: keyof PolishToggles, value: boolean) {
    toggles[key] = value;
  }

  async function applyPolish() {
    isPolishing.value = true;
    try {
      const css = buildToggleCSS(toggles);
      await sendCSSToPage(css);
      lastAppliedCSS.value = css;
      lastAppliedSource.value = 'toggles';
      activePresetId.value = null;
    } finally {
      isPolishing.value = false;
    }
  }

  async function generateAiStyle(prompt: string) {
    isGenerating.value = true;
    try {
      const css = await fetchAiCSS(prompt);
      await sendCSSToPage(css);
      lastAppliedCSS.value = css;
      lastAppliedSource.value = 'ai';
      activePresetId.value = null;
    } finally {
      isGenerating.value = false;
    }
  }

  async function revertStyles() {
    await sendCSSToPage('');
    lastAppliedCSS.value = null;
    lastAppliedSource.value = null;
    activePresetId.value = null;
  }

  // ── Preset Actions ─────────────────────────────────────────────────────────
  async function savePreset(name: string) {
    if (!lastAppliedCSS.value) return;

    const preset: UserPreset = {
      id: `preset_${Date.now()}`,
      name: name.trim(),
      css: lastAppliedCSS.value,
      source: lastAppliedSource.value ?? 'toggles',
      createdAt: Date.now(),
    };

    presets.value.push(preset);
    activePresetId.value = preset.id;
    await persistPresets();
  }

  async function applyPreset(id: string) {
    const preset = presets.value.find((p) => p.id === id);
    if (!preset) return;
    await sendCSSToPage(preset.css);
    lastAppliedCSS.value = preset.css;
    lastAppliedSource.value = preset.source;
    activePresetId.value = id;
  }

  async function deletePreset(id: string) {
    presets.value = presets.value.filter((p) => p.id !== id);
    if (activePresetId.value === id) activePresetId.value = null;
    await persistPresets();
  }

  async function renamePreset(id: string, newName: string) {
    const preset = presets.value.find((p) => p.id === id);
    if (preset) {
      preset.name = newName.trim();
      await persistPresets();
    }
  }

  // ── Private Helpers ────────────────────────────────────────────────────────
  function buildToggleCSS(t: PolishToggles): string {
    const rules: string[] = [];
    if (t.moreContrast) {
      rules.push(`
        body { background: #fff !important; color: #111 !important; }
        a    { color: #0055cc !important; }
      `);
    }
    if (t.extraSpacing) {
      rules.push(`
        p, li { line-height: 1.9 !important; letter-spacing: 0.02em !important; }
        p     { margin-bottom: 1.2em !important; }
      `);
    }
    if (t.vibrantColors) {
      rules.push(`:root { filter: saturate(1.4) contrast(1.05); }`);
    }
    if (t.betterFonts) {
      rules.push(`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        body, p, span, li, td {
          font-family: 'Inter', sans-serif !important;
          font-size: 15px !important;
        }
        h1, h2, h3 { font-weight: 600 !important; }
      `);
    }
    return rules.join('\n');
  }

  async function fetchAiCSS(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'GENERATE_CSS', prompt },
        (response: { css?: string; error?: string }) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response?.css ?? '');
          }
        },
      );
    });
  }

  async function sendCSSToPage(css: string): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { type: 'APPLY_CSS', css });
  }

  async function persistPresets(): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: presets.value });
  }

  return {
    selectedPreset,
    toggles,
    aiPrompt,
    autoApply,
    isPolishing,
    isGenerating,
    lastAppliedCSS,
    lastAppliedSource,
    presets,
    activePresetId,
    init,
    resetToDefaults,
    setToggle,
    applyPolish,
    generateAiStyle,
    revertStyles,
    savePreset,
    applyPreset,
    deletePreset,
    renamePreset,
  };
});
